"""
Automated Deployment Script for Hugging Face Spaces (Docker Space).

Usage:
    python deploy_hf.py --token <YOUR_HF_TOKEN>
    or set HF_TOKEN environment variable.
"""

import argparse
import os
import sys
from pathlib import Path
from huggingface_hub import HfApi, create_repo, login

BASE_DIR = Path(__file__).resolve().parent

def main():
    parser = argparse.ArgumentParser(description="Deploy AI Real Estate Advisor to Hugging Face Spaces.")
    parser.add_argument("--token", type=str, default=os.getenv("HF_TOKEN"), help="Hugging Face User Access Token (Write access)")
    parser.add_argument("--space-name", type=str, default="darglobal-wasalt-ai-advisor", help="Name of the Space")
    parser.add_argument("--private", action="store_true", help="Set Space to private")
    args = parser.parse_args()

    token = args.token
    if not token:
        token = input("Enter your Hugging Face Write Token (from https://huggingface.co/settings/tokens): ").strip()

    if not token:
        print("Error: No Hugging Face token provided. Deployment aborted.")
        sys.exit(1)

    print("Authenticating with Hugging Face...")
    login(token=token, add_to_git_credential=True)
    api = HfApi(token=token)

    user_info = api.whoami()
    username = user_info["name"]
    repo_id = f"{username}/{args.space_name}"
    print(f"Logged in as: {username}")
    print(f"Target Space Repo ID: {repo_id}")

    # Create Space if it doesn't already exist
    print(f"Creating / verifying Docker Space '{repo_id}'...")
    create_repo(
        repo_id=repo_id,
        repo_type="space",
        space_sdk="docker",
        private=args.private,
        exist_ok=True,
    )

    print(f"Uploading project files to Hugging Face Space '{repo_id}'...")
    # Upload folder excluding local temporary caches
    api.upload_folder(
        folder_path=str(BASE_DIR),
        repo_id=repo_id,
        repo_type="space",
        ignore_patterns=[
            ".git/**",
            ".git",
            "frontend/node_modules/**",
            "frontend/node_modules",
            "__pycache__/**",
            "*.pyc",
            ".env",
            ".env.local",
            "venv/**",
            ".venv/**",
        ],
    )

    live_url = f"https://{username}-{args.space_name}.hf.space"
    space_page_url = f"https://huggingface.co/spaces/{repo_id}"

    print("\n" + "=" * 65)
    print("DEPLOYMENT SUCCESSFUL!")
    print(f"Hugging Face Space Page: {space_page_url}")
    print(f"Direct Live Application: {live_url}")
    print("=" * 65 + "\n")
    print("Note: Hugging Face will now build the Docker container automatically.")
    print("It will be live in 1-2 minutes.")

if __name__ == "__main__":
    main()
