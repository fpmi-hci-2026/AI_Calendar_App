import os
import asyncio
from dotenv import load_dotenv
from openai import AsyncOpenAI

# Load .env file
load_dotenv()

async def test_deepseek():
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        print("ERROR: DEEPSEEK_API_KEY not found in .env")
        return

    print(f"Testing DeepSeek API with key: {api_key[:10]}...")
    
    try:
        client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        )
        
        response = await client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "user", "content": "Say 'Hello World' in Russian."}
            ],
            stream=False
        )
        print("SUCCESS! Response from DeepSeek:")
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"ERROR calling DeepSeek API: {e}")

if __name__ == "__main__":
    asyncio.run(test_deepseek())
