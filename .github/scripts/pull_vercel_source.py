#!/usr/bin/env python3
"""Pull the source files of a Vercel deployment into the current directory.

Reads VERCEL_TOKEN and DEPLOYMENT_HOST from the environment, resolves the
deployment, walks its file tree, and writes every file to disk relative to
the current working directory (the checked-out git repo).
"""
import base64
import binascii
import json
import os
import pathlib
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.vercel.com"
TOKEN = os.environ["VERCEL_TOKEN"]
HOST = os.environ.get("DEPLOYMENT_HOST", "sonae-review.vercel.app").strip()

SKIP_DIRS = {".git", "node_modules", ".next", ".vercel"}

MAX_RETRIES = 6


def request(path, params=None):
    url = API + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {TOKEN}"})
    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return resp.status, resp.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()
        except (urllib.error.URLError, ConnectionError, TimeoutError, OSError) as e:
            last_err = e
            wait = min(2 ** attempt, 20)
            print(f"Network error on {path} (attempt {attempt}/{MAX_RETRIES}): {e!r}, retrying in {wait}s", file=sys.stderr)
            time.sleep(wait)
    raise last_err


def get_json(path, params=None):
    status, body = request(path, params)
    if status >= 400:
        print(f"ERROR {status} for {path}: {body[:500]!r}", file=sys.stderr)
        return None
    try:
        return json.loads(body.decode("utf-8"))
    except json.JSONDecodeError:
        print(f"Non-JSON response for {path}: {body[:200]!r}", file=sys.stderr)
        return None


def resolve_team_id():
    data = get_json("/v2/teams")
    if data and data.get("teams"):
        team_id = data["teams"][0]["id"]
        print(f"Using team scope: {team_id}")
        return team_id
    print("No team scope found, using personal account scope.")
    return None


def resolve_deployment(team_id):
    params = {"teamId": team_id} if team_id else None
    dep = get_json(f"/v13/deployments/{HOST}", params)
    if dep and dep.get("id"):
        return dep["id"]
    # fallback: some accounts need the alias resolved via /v6/deployments list
    print("Direct lookup failed, trying deployments list fallback...", file=sys.stderr)
    list_params = {"limit": 1, "target": "production"}
    if team_id:
        list_params["teamId"] = team_id
    data = get_json("/v6/deployments", list_params)
    if data and data.get("deployments"):
        return data["deployments"][0]["uid"]
    return None


def fetch_tree(dep_id, team_id):
    params = {"teamId": team_id} if team_id else None
    for version in ("v9", "v6"):
        data = get_json(f"/{version}/deployments/{dep_id}/files", params)
        if data:
            # some versions wrap in {"files": [...]}, others return a list directly
            if isinstance(data, dict) and "files" in data:
                return data["files"]
            if isinstance(data, list):
                return data
    return None


def fetch_file_content(dep_id, uid, team_id):
    params = {"teamId": team_id} if team_id else None
    for version in ("v7", "v6"):
        status, body = request(f"/{version}/deployments/{dep_id}/files/{uid}", params)
        if status < 400:
            try:
                data = json.loads(body.decode("utf-8"))
                content = data.get("data", "")
                # Some API versions omit or mislabel "encoding" even though
                # "data" is base64. Decode whenever the content validates as
                # base64 rather than trusting the encoding field.
                try:
                    return base64.b64decode(content, validate=True)
                except (binascii.Error, ValueError):
                    return content.encode("utf-8")
            except (json.JSONDecodeError, UnicodeDecodeError):
                return body
    print(f"Failed to fetch content for uid={uid}", file=sys.stderr)
    return None


def walk(nodes, base, dep_id, team_id, counter):
    for node in nodes:
        name = node.get("name")
        ntype = node.get("type")
        if ntype == "directory":
            if name in SKIP_DIRS:
                continue
            newbase = base / name
            newbase.mkdir(parents=True, exist_ok=True)
            walk(node.get("children", []), newbase, dep_id, team_id, counter)
        elif ntype == "file":
            uid = node.get("uid")
            path = base / name
            path.parent.mkdir(parents=True, exist_ok=True)
            content = fetch_file_content(dep_id, uid, team_id)
            if content is None:
                continue
            path.write_bytes(content)
            counter[0] += 1
            if counter[0] % 20 == 0:
                print(f"...{counter[0]} files written")


def main():
    team_id = resolve_team_id()
    print(f"Resolving deployment for host: {HOST}")
    dep_id = resolve_deployment(team_id)
    if not dep_id:
        print("Could not resolve deployment id.", file=sys.stderr)
        sys.exit(1)
    print(f"Deployment id: {dep_id}")

    tree = fetch_tree(dep_id, team_id)
    if not tree:
        print("Could not fetch file tree.", file=sys.stderr)
        sys.exit(1)

    counter = [0]
    walk(tree, pathlib.Path("."), dep_id, team_id, counter)
    print(f"Done. Wrote {counter[0]} files.")


if __name__ == "__main__":
    main()
