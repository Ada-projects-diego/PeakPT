import base64
from openai import OpenAI
from datetime import date

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Path to your image
image_path = "files/hand_written_workout.jpg"

# Getting the base64 string
base64_image = encode_image(image_path)

# Initialize the OpenAI client

client = OpenAI(api_key="")

# Get today's date
today = date.today().strftime("%Y-%m-%d")

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": f"""Analyze this image and return the workout data in the following JSON format:
                {{
                    "date": "{today}",
                    "name": "My workout",
                    "exercises": [
                        {{
                            "id": "1",
                            "name": "<exercise name>",
                            "sets": [
                                {{
                                    "id": "1",
                                    "reps": <number of reps>,
                                    "weight": <weight used>
                                }},
                                ...
                            ]
                        }},
                        ...
                    ]
                }}
                Include all exercises and sets visible in the image. Note you might get stuff like 3x10 format sometimes. Assume the first number is the sets, and the later the reps. In this case we would have 3 sets of 10 reps each. When no weight, use 0. ONLY return the data in JSON format. DO NOT include any other information. DO NOT WRAP IN MARKDOWN e.g. NO json```[]``` just the json"""},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    },
                },
            ],
        }
    ],
    max_tokens=1000,
)

print(response.choices[0].message.content)