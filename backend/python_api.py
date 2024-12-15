from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
import os
import dotenv

# load environment variables
dotenv.load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# initialize fastapi
app = FastAPI()

class LargeRequestMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_body = await request.body()
        return await call_next(request)

origins = [
    "http://localhost:3002",  # your local frontend
    "https://quityoutube.com",  # production frontend
]

# add cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # allow all HTTP methods
    allow_headers=["*"],  # allow all HTTP headers
)

app.add_middleware(LargeRequestMiddleware)

# utility functions
def extract_video_id(video_url):
    """
    Extract the video ID from a YouTube URL.
    """
    try:
        # e.g., https://www.youtube.com/watch?v=hwLY6ojH_0I -> hwLY6ojH_0I
        video_id = video_url.split("v=")[1].split("&")[0]
        return video_id
    except IndexError:
        raise ValueError(f"Invalid YouTube URL: {video_url}")

def fetch_video_metadata(video_id):
    """
    Fetch video metadata from the YouTube Data API.
    """
    url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id={video_id}&key={YOUTUBE_API_KEY}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Ensure the video exists
        if not data.get("items"):
            return {"video_id": video_id, "error": "Video not found"}

        video_data = data["items"][0]
        snippet = video_data.get("snippet", {})
        content_details = video_data.get("contentDetails", {})
        statistics = video_data.get("statistics", {})

        # Parse metadata
        return {
            "video_id": video_id,
            "video_title": snippet.get("title", "Title not found"),
            "length_seconds": parse_duration(content_details.get("duration")),
            "keywords": snippet.get("tags", []),
            "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url", "Thumbnail not found"),
            "view_count": statistics.get("viewCount", "View count not found"),
            "category": snippet.get("categoryId", "Category not found"),  # Category ID requires extra lookup
            "upload_date": snippet.get("publishedAt", "Upload date not found"),
            "channel_id": snippet.get("channelId", "Channel ID not found"),
            "channel_name": snippet.get("channelTitle", "Author not found"),
            "channel_url": f"https://www.youtube.com/channel/{snippet.get('channelId', '')}",
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching metadata for video {video_id}: {e}")
        return {"video_id": video_id, "error": "Failed to fetch video metadata"}

def parse_duration(duration):
    """
    Parse ISO 8601 duration (e.g., PT1H2M30S -> seconds).
    """
    import isodate
    try:
        parsed_duration = isodate.parse_duration(duration)
        return int(parsed_duration.total_seconds())
    except Exception as e:
        print(f"Error parsing duration: {e}")
        return None

# request model
class WatchHistoryRequest(BaseModel):
    watch_history: list

# fastapi endpoint
@app.post("/scrape-watch-history/")
def scrape_watch_history(request: WatchHistoryRequest):
    watch_history = request.watch_history

    if not watch_history:
        raise HTTPException(status_code=400, detail="No watch history provided")

    video_links = [item["titleUrl"] for item in watch_history if "titleUrl" in item]

    # parallel fetching with ThreadPoolExecutor
    results = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_url = {
            executor.submit(fetch_video_metadata, extract_video_id(url)): url for url in video_links
        }

        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                data = future.result()
                # add watch date to the result
                watch_date = next(item["time"] for item in watch_history if item["titleUrl"] == url)
                data["watch_date"] = watch_date
                results.append(data)
            except Exception as e:
                print(f"Failed to fetch metadata for {url}: {e}")
                results.append({"video_url": url, "error": "Failed to fetch metadata"})

    return JSONResponse(content={"message": "Scraping complete", "data": results})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=3005)