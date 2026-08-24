import requests
import json
import os
from datetime import datetime, timedelta

class LeetCodeAPI:
    URL = "https://leetcode.com/graphql"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/138.0 Safari/537.36"
            ),
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com/"
        })

    def graphql(self, query, variables):
        response = self.session.post(
            self.URL,
            json={
                "query": query,
                "variables": variables
            }
        )
        response.raise_for_status()
        return response.json()["data"]

    def get_all(self, username):
        query = """
        query getEverything($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              realName
              userAvatar
              ranking
              reputation
              starRating
              aboutMe
              school
              company
              countryName
              skillTags
            }
            submitStats {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            badges {
              id
              displayName
              icon
              creationDate
            }
            languageProblemCount {
              languageName
              problemsSolved
            }
            tagProblemCounts {
              advanced {
                tagName
                problemsSolved
              }
              intermediate {
                tagName
                problemsSolved
              }
              fundamental {
                tagName
                problemsSolved
              }
            }
            userCalendar {
              streak
              totalActiveDays
              activeYears
              submissionCalendar
            }
          }
          allQuestionsCount {
            difficulty
            count
          }
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            totalParticipants
            topPercentage
            badge {
              name
            }
          }
          userContestRankingHistory(username: $username) {
            attended
            rating
            ranking
            problemsSolved
            totalProblems
            finishTimeInSeconds
            contest {
              title
              startTime
            }
          }
          recentAcSubmissionList(username: $username) {
            id
            title
            titleSlug
            timestamp
          }
        }
        """
        try:
            return self.graphql(query, {"username": username})
        except Exception as e:
            print(f"Error fetching LeetCode for {username}: {e}")
            return None


class GitHubAPI:
    def __init__(self, token: str):
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json"
        }

    def get_user_repositories(self, username: str) -> list:
        repos = []
        page = 1
        while True:
            url = (
                f"https://api.github.com/users/{username}/repos"
                f"?per_page=100&page={page}&sort=updated"
            )
            response = requests.get(url, headers=self.headers, timeout=15)
            if response.status_code != 200:
                print(f"GitHub API Error {response.status_code}: {response.text}")
                return repos
            
            data = response.json()
            if not data:
                break
            
            for repo in data:
                repos.append({
                    "id": repo["id"],
                    "name": repo["name"],
                    "full_name": repo["full_name"],
                    "description": repo["description"],
                    "private": repo["private"],
                    "fork": repo["fork"],
                    "language": repo["language"],
                    "stars": repo["stargazers_count"],
                    "forks": repo["forks_count"],
                    "created_at": repo["created_at"],
                    "updated_at": repo["updated_at"],
                    "pushed_at": repo["pushed_at"],
                })
            page += 1
        return repos


def calculate_github_score(repos: list) -> dict:
    if not repos:
        return {"score": 0, "breakdown": {}}
        
    repo_count = len(repos)
    total_stars = sum(r.get("stars", 0) for r in repos)
    total_forks = sum(r.get("forks", 0) for r in repos)
    original_repos = sum(1 for r in repos if not r.get("fork", False))
    
    unique_languages = set(r.get("language") for r in repos if r.get("language"))
    lang_count = len(unique_languages)
    
    # Calculate recently active repos (pushed in last 6 months)
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    recently_active = 0
    for r in repos:
        pushed_at = r.get("pushed_at")
        if pushed_at:
            try:
                # Handle ISO 8601 string
                pushed_date = datetime.strptime(pushed_at.replace('Z', '+0000'), "%Y-%m-%dT%H:%M:%S%z")
                if pushed_date.replace(tzinfo=None) > six_months_ago:
                    recently_active += 1
            except Exception:
                pass

    # Score out of 40
    # Repos (max 8)
    repo_score = min(repo_count / 15.0, 1.0) * 8
    # Stars (max 8)
    star_score = min(total_stars / 50.0, 1.0) * 8
    # Forks (max 6)
    fork_score = min(total_forks / 20.0, 1.0) * 6
    # Languages (max 6)
    lang_score = min(lang_count / 5.0, 1.0) * 6
    # Original Repos (max 6)
    orig_score = min(original_repos / 10.0, 1.0) * 6
    # Recent Activity (max 6)
    recent_score = min(recently_active / 5.0, 1.0) * 6
    
    total = repo_score + star_score + fork_score + lang_score + orig_score + recent_score
    
    return {
        "score": round(total, 2),
        "breakdown": {
            "Total Public Repos": round(repo_score, 2),
            "Total Stars Received": round(star_score, 2),
            "Total Forks Received": round(fork_score, 2),
            "Language Diversity": round(lang_score, 2),
            "Non-Fork Original Repos": round(orig_score, 2),
            "Recent Activity": round(recent_score, 2)
        },
        "stats": {
            "repo_count": repo_count,
            "total_stars": total_stars,
            "total_forks": total_forks,
            "languages": list(unique_languages),
            "original_repos": original_repos,
            "recently_active": recently_active
        }
    }


def calculate_leetcode_score(data: dict) -> dict:
    if not data or "matchedUser" not in data or not data["matchedUser"]:
        return {"score": 0, "breakdown": {}}
        
    user = data["matchedUser"]
    
    # Problems solved
    submit_stats = user.get("submitStats", {}).get("acSubmissionNum", [])
    easy = medium = hard = 0
    for stat in submit_stats:
        if stat["difficulty"] == "Easy":
            easy = stat["count"]
        elif stat["difficulty"] == "Medium":
            medium = stat["count"]
        elif stat["difficulty"] == "Hard":
            hard = stat["count"]
            
    # Contest rating
    contest = data.get("userContestRanking") or {}
    rating = contest.get("rating", 0)
    
    # Calendar
    calendar = user.get("userCalendar", {})
    streak = calendar.get("streak", 0)
    active_days = calendar.get("totalActiveDays", 0)
    
    # Score out of 35
    # Easy (max 5)
    easy_score = min(easy / 50.0, 1.0) * 5
    # Medium (max 10)
    med_score = min(medium / 80.0, 1.0) * 10
    # Hard (max 10)
    hard_score = min(hard / 30.0, 1.0) * 10
    # Rating (max 5)
    rating_score = min(rating / 2000.0, 1.0) * 5
    # Streak (max 3)
    streak_score = min(streak / 30.0, 1.0) * 3
    # Active Days (max 2)
    active_score = min(active_days / 200.0, 1.0) * 2
    
    total = easy_score + med_score + hard_score + rating_score + streak_score + active_score
    
    return {
        "score": round(total, 2),
        "breakdown": {
            "Easy Problems Solved": round(easy_score, 2),
            "Medium Problems Solved": round(med_score, 2),
            "Hard Problems Solved": round(hard_score, 2),
            "Contest Rating": round(rating_score, 2),
            "Current Streak": round(streak_score, 2),
            "Total Active Days": round(active_score, 2)
        },
        "stats": {
            "easy": easy,
            "medium": medium,
            "hard": hard,
            "rating": rating,
            "streak": streak,
            "active_days": active_days
        }
    }


def calculate_profile_score(profile: dict) -> dict:
    if not profile:
        return {"score": 0, "breakdown": {}}
        
    # Max 25 points
    education_score = 5 if profile.get("education") and len(profile["education"]) > 0 else 0
    experience_score = 5 if profile.get("experience") and len(profile["experience"]) > 0 else 0
    projects_score = 5 if profile.get("projects") and len(profile["projects"]) > 0 else 0
    skills_score = 4 if profile.get("skills") and len(profile["skills"]) > 0 else 0
    
    has_achievements = profile.get("achievements") and len(profile["achievements"]) > 0
    has_certs = profile.get("certifications") and len(profile["certifications"]) > 0
    achieve_cert_score = 3 if has_achievements or has_certs else 0
    
    gh_connected = 1.5 if profile.get("github_username") else 0
    lc_connected = 1.5 if profile.get("leetcode_username") else 0
    connection_score = gh_connected + lc_connected
    
    total = education_score + experience_score + projects_score + skills_score + achieve_cert_score + connection_score
    
    return {
        "score": round(total, 2),
        "breakdown": {
            "Education": education_score,
            "Experience": experience_score,
            "Projects": projects_score,
            "Skills": skills_score,
            "Achievements/Certifications": achieve_cert_score,
            "Connected Accounts": connection_score
        }
    }


def compute_katalyst_score(profile: dict, github_token: str) -> dict:
    """Computes the full Katalyst score for a student."""
    
    # 1. GitHub
    github_score_data = {"score": 0, "breakdown": {}}
    gh_username = profile.get("github_username")
    if gh_username and github_token:
        gh_api = GitHubAPI(github_token)
        repos = gh_api.get_user_repositories(gh_username)
        github_score_data = calculate_github_score(repos)
        
    # 2. LeetCode
    leetcode_score_data = {"score": 0, "breakdown": {}}
    lc_username = profile.get("leetcode_username")
    if lc_username:
        lc_api = LeetCodeAPI()
        lc_data = lc_api.get_all(lc_username)
        leetcode_score_data = calculate_leetcode_score(lc_data)
        
    # 3. Profile
    profile_score_data = calculate_profile_score(profile)
    
    total_score = github_score_data["score"] + leetcode_score_data["score"] + profile_score_data["score"]
    
    return {
        "total_score": round(total_score), # Round to nearest int for main score
        "components": {
            "github": github_score_data,
            "leetcode": leetcode_score_data,
            "profile": profile_score_data
        }
    }
