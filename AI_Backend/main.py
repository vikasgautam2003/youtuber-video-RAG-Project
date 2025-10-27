# import os
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from dotenv import load_dotenv
# from pathlib import Path
# from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
# from langchain_text_splitters import RecursiveCharacterTextSplitter # New Path
# from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
# from langchain_community.vectorstores import FAISS
# from langchain_core.prompts import PromptTemplate
# from langchain_core.runnables import RunnablePassthrough
# from langchain_core.output_parsers import StrOutputParser

# env_path = Path('.') / '.env'
# print(f"Looking for .env file at: {env_path.resolve()}")
# load_dotenv(dotenv_path=env_path)

# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# if not GEMINI_API_KEY:
#     print("--- ERROR ---")
#     print("GEMINI_API_KEY not found. Make sure your .env file is in the 'backend' folder and named correctly.")
#     print("-------------")
#     raise EnvironmentError("GEMINI_API_KEY not found in .env file")
# else:
#     print(f"GEMINI_API_KEY loaded successfully, starting with: {GEMINI_API_KEY[:4]}...")

# # def get_youtube_transcript(video_id: str) -> str | None:
# #     print(f"Fetching transcript for video ID: {video_id}...")
# #     try:
# #         api = YouTubeTranscriptApi()
# #         transcript_snippets = api.fetch(video_id, languages=['en'])
# #         transcript_text = " ".join(snippet.text for snippet in transcript_snippets)
# #         print("Transcript fetched successfully.")
# #         return transcript_text
# #     except TranscriptsDisabled:
# #         print(f"Transcripts are disabled for video: {video_id}")
# #         return None
# #     except Exception as e:
# #         print(f"An error occurred while fetching transcript: {e}")
# #         return None





# def get_youtube_transcript(video_id: str) -> str | None:
#     """
#     Fetches the transcript for a given YouTube video ID.
#     Tries manual/generated 'en' first. If that fails, attempts to
#     translate an existing transcript into English.
#     """
#     print(f"Fetching transcript for video ID: {video_id}...")
#     api = YouTubeTranscriptApi()
    
#     try:
#         # 1. Try fetching English directly
#         print("Attempting to fetch direct English transcript...")
#         transcript_snippets = api.fetch(video_id, languages=['en'])
#         transcript_text = " ".join(snippet.text for snippet in transcript_snippets)
#         print("Direct English transcript fetched successfully.")
#         return transcript_text
        
#     except NoTranscriptFound as e:
#         print(f"Direct English transcript not found: {e}. Attempting translation...")
#         try:
#             # 2. If direct 'en' fails, list available transcripts
#             transcript_list = api.list(video_id)
            
#             # --- THIS IS THE FIX ---
#             # Create a list of all available language codes found
#             available_langs = [t.language_code for t in transcript_list]
#             if not available_langs:
#                  print("No transcripts available in any language.")
#                  return None

#             print(f"Available language codes: {available_langs}")

#             # 3. Find the 'best' transcript among the available ones
#             # find_transcript prefers manual over generated automatically
#             transcript_to_translate = transcript_list.find_transcript(available_langs)
#             print(f"Selected transcript in '{transcript_to_translate.language}' to translate.")

#             # 4. Translate it to English
#             print("Translating transcript to English...")
#             translated_snippets = transcript_to_translate.translate('en').fetch()
#             transcript_text = " ".join(snippet.text for snippet in translated_snippets)
#             print("Transcript translated to English successfully.")
#             return transcript_text
#             # --- END FIX ---
                
#         except TranscriptsDisabled:
#              print(f"Transcripts are disabled for video (during translation attempt): {video_id}")
#              return None
#         except Exception as e_trans:
#              print(f"An error occurred during translation attempt: {e_trans}")
#              return None
             
#     except TranscriptsDisabled:
#         print(f"Transcripts are disabled for video (initial fetch): {video_id}")
#         return None
#     except Exception as e_main:
#         print(f"An unexpected error occurred: {e_main}")
#         return None





# def create_rag_chain(video_id: str):
#     transcript = get_youtube_transcript(video_id)
#     if not transcript:
#         print("Failed to build RAG chain: No transcript available.")
#         return None
#     text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
#     chunks = text_splitter.split_text(transcript)
#     if not chunks:
#         print("Failed to build RAG chain: Transcript could not be split.")
#         return None
#     print(f"Transcript split into {len(chunks)} chunks.")
#     try:
#         embeddings = GoogleGenerativeAIEmbeddings(
#             model="models/gemini-embedding-001",
#             google_api_key=GEMINI_API_KEY
#         )
#         print("Creating vector store...")
#         vector_store = FAISS.from_texts(chunks, embeddings)
#         retriever = vector_store.as_retriever(search_kwargs={"k": 4})
#         llm = ChatGoogleGenerativeAI(
#             model="gemini-2.5-pro", 
#             google_api_key=GEMINI_API_KEY
#         )
#         prompt_template = """
#         You are a helpful YouTube assistant. Answer the user's question
#         based *only* on the following transcript context.
#         If the answer is not in the context, say so.

#         CONTEXT:
#         {context}

#         QUESTION:
#         {question}

#         ANSWER:
#         """
#         prompt = PromptTemplate.from_template(prompt_template)
#         def format_docs(docs):
#             return "\n\n---\n\n".join(doc.page_content for doc in docs)
#         rag_chain = (
#             {"context": retriever | format_docs, "question": RunnablePassthrough()}
#             | prompt
#             | llm
#             | StrOutputParser()
#         )
#         print("RAG chain created successfully.")
#         return rag_chain
#     except Exception as e:
#         print(f"An error occurred during RAG chain creation: {e}")
#         return None

# app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class ChatRequest(BaseModel):
#     video_id: str
#     query: str

# chain_cache = {}

# @app.post("/api/chat")
# async def chat_with_video(request: ChatRequest):
#     print(f"Received request for video: {request.video_id}")
#     chain = None
#     if request.video_id in chain_cache:
#         print("Loading RAG chain from cache.")
#         chain = chain_cache[request.video_id]
#     else:
#         print("Building new RAG chain...")
#         chain = create_rag_chain(request.video_id)
#         if chain:
#             print("Storing new chain in cache.")
#             chain_cache[request.video_id] = chain
#     if not chain:
#         raise HTTPException(status_code=500, detail="Failed to create RAG chain. Check transcript availability.")
#     try:
#         print(f"Invoking chain with query: '{request.query}'")
#         answer = chain.invoke(request.query)
#         print("Answer received.")
#         return {"answer": answer}
#     except Exception as e:
#         print(f"An error occurred during chain invocation: {e}")
#         raise HTTPException(status_code=500, detail=str(e))

# if __name__ == "__main__":
#     import uvicorn
#     print("Starting FastAPI server on http://localhost:8000")
#     uvicorn.run(app, host="0.0.0.0", port=8000)




import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

env_path = Path('.') / '.env'
print(f"[DEBUG] Looking for .env file at: {env_path.resolve()}")
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("[ERROR] GEMINI_API_KEY not found. Make sure your .env file is correct.")
    raise EnvironmentError("GEMINI_API_KEY not found in .env file")
else:
    print(f"[DEBUG] GEMINI_API_KEY loaded successfully, starting with: {GEMINI_API_KEY[:4]}...")

def get_youtube_transcript(video_id: str) -> str | None:
    print(f"[DEBUG] Entering get_youtube_transcript with video_id: {video_id}")
    api = YouTubeTranscriptApi()
    
    try:
        print("[DEBUG] Attempting to fetch direct English transcript...")
        transcript_snippets = api.fetch(video_id, languages=['en'])
        transcript_text = " ".join(snippet.text for snippet in transcript_snippets)
        print("[DEBUG] Direct English transcript fetched successfully.")
        return transcript_text
    except NoTranscriptFound as e:
        print(f"[DEBUG] Direct English transcript not found: {e}. Attempting translation...")
        try:
            transcript_list = api.list(video_id)
            available_langs = [t.language_code for t in transcript_list]
            if not available_langs:
                print("[DEBUG] No transcripts available in any language.")
                return None

            print(f"[DEBUG] Available language codes: {available_langs}")
            transcript_to_translate = transcript_list.find_transcript(available_langs)
            print(f"[DEBUG] Selected transcript in '{transcript_to_translate.language}' to translate.")
            print("[DEBUG] Translating transcript to English...")
            translated_snippets = transcript_to_translate.translate('en').fetch()
            transcript_text = " ".join(snippet.text for snippet in translated_snippets)
            print("[DEBUG] Transcript translated to English successfully.")
            return transcript_text
        except TranscriptsDisabled:
            print(f"[DEBUG] Transcripts are disabled for video (translation attempt): {video_id}")
            return None
        except Exception as e_trans:
            print(f"[ERROR] Error during translation attempt: {e_trans}")
            return None
    except TranscriptsDisabled:
        print(f"[DEBUG] Transcripts are disabled for video (initial fetch): {video_id}")
        return None
    except Exception as e_main:
        print(f"[ERROR] Unexpected error in get_youtube_transcript: {e_main}")
        return None

def create_rag_chain(video_id: str):
    print(f"[DEBUG] Entering create_rag_chain with video_id: {video_id}")
    transcript = get_youtube_transcript(video_id)
    if not transcript:
        print("[ERROR] Failed to build RAG chain: No transcript available.")
        return None

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    print("[DEBUG] Splitting transcript into chunks...")
    chunks = text_splitter.split_text(transcript)
    if not chunks:
        print("[ERROR] Failed to split transcript.")
        return None
    print(f"[DEBUG] Transcript split into {len(chunks)} chunks.")

    try:
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=GEMINI_API_KEY
        )
        print("[DEBUG] Creating vector store from chunks...")
        vector_store = FAISS.from_texts(chunks, embeddings)
        retriever = vector_store.as_retriever(search_kwargs={"k": 4})
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-pro", 
            google_api_key=GEMINI_API_KEY
        )

        prompt_template = """
        You are a helpful YouTube assistant. Answer the user's question
        based *only* on the following transcript context.
        If the answer is not in the context, say so.

        CONTEXT:
        {context}

        QUESTION:
        {question}

        ANSWER:
        """
        prompt = PromptTemplate.from_template(prompt_template)
        def format_docs(docs):
            print(f"[DEBUG] Formatting {len(docs)} documents for chain input...")
            return "\n\n---\n\n".join(doc.page_content for doc in docs)
        
        rag_chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        print("[DEBUG] RAG chain created successfully.")
        return rag_chain
    except Exception as e:
        print(f"[ERROR] Error during RAG chain creation: {e}")
        return None

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    video_id: str
    query: str

chain_cache = {}

@app.post("/api/chat")
async def chat_with_video(request: ChatRequest):
    print(f"[DEBUG] Received chat request for video: {request.video_id}")
    chain = None
    if request.video_id in chain_cache:
        print("[DEBUG] Loading RAG chain from cache.")
        chain = chain_cache[request.video_id]
    else:
        print("[DEBUG] Building new RAG chain...")
        chain = create_rag_chain(request.video_id)
        if chain:
            print("[DEBUG] Storing new chain in cache.")
            chain_cache[request.video_id] = chain

    if not chain:
        print("[ERROR] RAG chain creation failed.")
        raise HTTPException(status_code=500, detail="Failed to create RAG chain. Check transcript availability.")

    try:
        print(f"[DEBUG] Invoking chain with query: '{request.query}'")
        answer = chain.invoke(request.query)
        print("[DEBUG] Chain invocation successful. Answer ready.")
        return {"answer": answer}
    except Exception as e:
        print(f"[ERROR] Error during chain invocation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("[DEBUG] Starting FastAPI server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
