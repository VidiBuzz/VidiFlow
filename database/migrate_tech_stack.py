#!/usr/bin/env python3
"""
VidiSmart Tech Stack Database Migration Script
Converts vidismart.masterlist.v3.html data to database format
For vidiflow and vidi.news interfaces
"""

import json
import re
import uuid
from datetime import datetime
from typing import Dict, List, Any

# Tech URLs mapping from the HTML file
TECH_URLS = {
    # Vision AI & Computer Vision
    "YOLO v11": "https://docs.ultralytics.com/models/yolo11/",
    "MediaPipe": "https://mediapipe.dev/",
    "OpenCV": "https://opencv.org/",
    "PyTorch": "https://pytorch.org/",
    "TensorRT": "https://developer.nvidia.com/tensorrt",
    "Detectron2": "https://github.com/facebookresearch/detectron2",
    "DeepStream": "https://developer.nvidia.com/deepstream-sdk",
    "Roboflow": "https://roboflow.com/",
    "SAM 2": "https://segment-anything.com/",
    "Ultralytics": "https://ultralytics.com/",
    "MMDetection": "https://github.com/open-mmlab/mmdetection",
    "Tesseract": "https://github.com/tesseract-ocr/tesseract",
    "FFmpeg": "https://ffmpeg.org/",
    "GStreamer": "https://gstreamer.freedesktop.org/",
    "Albumentations": "https://albumentations.ai/",
    "HuggingFace Vision": "https://huggingface.co/models?pipeline_tag=image-classification",
    "ClearML": "https://clear.ml/",
    "DVC": "https://dvc.org/",
    "Label Studio": "https://labelstud.io/",
    "FiftyOne": "https://voxel51.com/fiftyone/",
    
    # Generative Video & Creative AI
    "Sora API": "https://openai.com/sora",
    "Runway Gen-3": "https://runwayml.com/",
    "Luma Dream Machine": "https://lumalabs.ai/dream-machine",
    "Stable Video Diffusion": "https://stability.ai/",
    "Pika Labs": "https://pika.art/",
    "HeyGen": "https://heygen.com/",
    "Synthesia": "https://synthesia.io/",
    "Kaiber": "https://kaiber.ai/",
    "Leonardo.ai": "https://leonardo.ai/",
    "Midjourney": "https://midjourney.com/",
    "DALL-E 3": "https://openai.com/dall-e-3",
    "ComfyUI": "https://github.com/comfyanonymous/ComfyUI",
    "Automatic1111": "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
    "ControlNet": "https://github.com/lllyasviel/ControlNet",
    "AnimateDiff": "https://animatediff.github.io/",
    "EbSynth": "https://ebsynth.com/",
    "Topaz Labs": "https://topazlabs.com/",
    "ElevenLabs": "https://elevenlabs.io/",
    "Sunno": "https://suno.ai/",
    "Udios": "https://udio.com/",
    
    # LLMs & Agentic Orchestration
    "GPT-5 (o1)": "https://openai.com/",
    "Claude Sonnet 4.6": "https://claude.ai/",
    "Gemini 1.5 Pro": "https://deepmind.google/technologies/gemini/",
    "Llama 3.1": "https://llama.meta.com/",
    "Mistral Large": "https://mistral.ai/",
    "DeepSeek V3": "https://deepseek.com/",
    "LangChain": "https://langchain.com/",
    "LlamaIndex": "https://llamaindex.ai/",
    "AutoGPT": "https://agpt.co/",
    "CrewAI": "https://crewai.com/",
    "Microsoft Autogen": "https://microsoft.github.io/autogen/",
    "vLLM": "https://vllm.ai/",
    "Ollama": "https://ollama.ai/",
    "Groq": "https://groq.com/",
    "Together AI": "https://together.ai/",
    "DeepL": "https://deepl.com/",
    "LangSmith": "https://smith.langchain.com/",
    "Weights & Biases": "https://wandb.ai/",
    "PromptLayer": "https://promptlayer.com/",
    "DSPy": "https://dspy-docs.vercel.app/",
    
    # Vector Databases & RAG
    "Pinecone": "https://pinecone.io/",
    "Milvus": "https://milvus.io/",
    "Qdrant": "https://qdrant.tech/",
    "Weaviate": "https://weaviate.io/",
    "ChromaDB": "https://trychroma.com/",
    "Zilliz": "https://zilliz.com/",
    "Elasticsearch": "https://elastic.co/elasticsearch",
    "Vespa": "https://vespa.ai/",
    "Faiss": "https://github.com/facebookresearch/faiss",
    "LanceDB": "https://lancedb.com/",
    "SurrealDB": "https://surrealdb.com/",
    "Pgvector": "https://github.com/pgvector/pgvector",
    "Voyage AI": "https://voyage.ai/",
    "Cohere Embed": "https://cohere.com/embed",
    "Voyage Embed": "https://voyage.ai/",
    "Nomic AI": "https://nomic.ai/",
    "Unstructured.io": "https://unstructured.io/",
    "RAGFlow": "https://ragflow.io/",
    "Verba": "https://github.com/weaviate/Verba",
    "Haystack": "https://haystack.deepset.ai/",
    
    # Structured & Real-time Data
    "PostgreSQL 17": "https://postgresql.org/",
    "MongoDB": "https://mongodb.com/",
    "Redis Stack": "https://redis.io/",
    "ClickHouse": "https://clickhouse.com/",
    "TiDB": "https://pingcap.com/",
    "CockroachDB": "https://cockroachlabs.com/",
    "ScyllaDB": "https://scylladb.com/",
    "Neo4j": "https://neo4j.com/",
    "TimescaleDB": "https://timescale.com/",
    "Snowflake": "https://snowflake.com/",
    "BigQuery": "https://cloud.google.com/bigquery",
    "Supabase": "https://supabase.com/",
    "PlanetScale": "https://planetscale.com/",
    "Neon": "https://neon.tech/",
    "EdgeDB": "https://edgedb.com/",
    "Meilisearch": "https://meilisearch.com/",
    "Typesense": "https://typesense.org/",
    "InfluxDB": "https://influxdata.com/",
    "Couchbase": "https://couchbase.com/",
    
    # Messaging & Event Streaming
    "Apache Kafka": "https://kafka.apache.org/",
    "Redpanda": "https://redpanda.com/",
    "RabbitMQ": "https://rabbitmq.com/",
    "NATS": "https://nats.io/",
    "Apache Pulsar": "https://pulsar.apache.org/",
    "AWS Kinesis": "https://aws.amazon.com/kinesis/",
    "Confluent": "https://confluent.io/",
    "Upstash": "https://upstash.com/",
    "Ably": "https://ably.com/",
    "Pusher": "https://pusher.com/",
    "Socket.io": "https://socket.io/",
    "Centrifugo": "https://centrifugal.dev/",
    "Temporal.io": "https://temporal.io/",
    "Apache Flink": "https://flink.apache.org/",
    "Benthos": "https://benthos.dev/",
    "Vector.dev": "https://vector.dev/",
    "Logstash": "https://elastic.co/logstash",
    "Fluentd": "https://fluentd.org/",
    "StreamNative": "https://streamnative.io/",
    "WarpStream": "https://warpstream.com/",
    
    # Core Programming Languages
    "Rust": "https://rust-lang.org/",
    "Python 3.13": "https://python.org/",
    "TypeScript 5.x": "https://typescriptlang.org/",
    "Go": "https://go.dev/",
    "C++ 23": "https://isocpp.org/",
    "Java 21": "https://oracle.com/java/",
    "Swift (SwiftUI)": "https://developer.apple.com/swift/",
    "Kotlin": "https://kotlinlang.org/",
    "Zig": "https://ziglang.org/",
    "Mojo": "https://modular.com/mojo",
    "SQL": "https://iso.org/standard/76583.html",
    "Elixir": "https://elixir-lang.org/",
    "C#": "https://dotnet.microsoft.com/languages/csharp",
    "Dart": "https://dart.dev/",
    "PHP 8.4": "https://php.net/",
    "Ruby 3.3": "https://ruby-lang.org/",
    "Scala": "https://scala-lang.org/",
    "Haskell": "https://haskell.org/",
    "Bash": "https://gnu.org/software/bash/",
    
    # Backend Frameworks
    "Next.js 16": "https://nextjs.org/",
    "FastAPI": "https://fastapi.tiangolo.com/",
    "Axum (Rust)": "https://github.com/tokio-rs/axum",
    "Gin (Go)": "https://gin-gonic.com/",
    "NestJS": "https://nestjs.com/",
    "Django": "https://djangoproject.com/",
    "Spring Boot": "https://spring.io/projects/spring-boot",
    "Laravel": "https://laravel.com/",
    "ElysiaJS": "https://elysiajs.com/",
    "Hono": "https://hono.dev/",
    "Go Buffalo": "https://gobuffalo.io/",
    "Actix": "https://actix.rs/",
    "Ruby on Rails": "https://rubyonrails.org/",
    "Fiber": "https://gofiber.io/",
    "AdonisJS": "https://adonisjs.com/",
    "Fastify": "https://fastify.io/",
    "Koa": "https://koajs.com/",
    "Rocket": "https://rocket.rs/",
    "Quarkus": "https://quarkus.io/",
    "Micronaut": "https://micronaut.io/",
    
    # Frontend & UI Engineering
    "React 19": "https://react.dev/",
    "Vue 3": "https://vuejs.org/",
    "SvelteKit": "https://kit.svelte.dev/",
    "Tailwind CSS": "https://tailwindcss.com/",
    "Shadcn UI": "https://ui.shadcn.com/",
    "Framer Motion": "https://framer.com/motion/",
    "Three.js": "https://threejs.org/",
    "D3.js": "https://d3js.org/",
    "TanStack Query": "https://tanstack.com/query",
    "Zustand": "https://zustand-demo.pmnd.rs/",
    "Redux Toolkit": "https://redux-toolkit.js.org/",
    "Radix UI": "https://radix-ui.com/",
    "Lucide Icons": "https://lucide.dev/",
    "PostCSS": "https://postcss.org/",
    "Vite": "https://vitejs.dev/",
    "Turbopack": "https://turbo.build/pack",
    "Astro": "https://astro.build/",
    "SolidJS": "https://solidjs.com/",
    "Qwik": "https://qwik.builder.io/",
    "Storybook": "https://storybook.js.org/",
    
    # Mobile & Edge App Dev
    "React Native": "https://reactnative.dev/",
    "Flutter": "https://flutter.dev/",
    "Expo": "https://expo.dev/",
    "SwiftUI": "https://developer.apple.com/xcode/swiftui/",
    "Jetpack Compose": "https://developer.android.com/jetpack/compose",
    "Capacitor": "https://capacitorjs.com/",
    "Ionic": "https://ionicframework.com/",
    "Tamagui": "https://tamagui.dev/",
    "NativeScript": "https://nativescript.org/",
    "Appflow": "https://ionic.io/appflow",
    "Codemagic": "https://codemagic.io/",
    "RevenueCat": "https://revenuecat.com/",
    "Firebase Auth": "https://firebase.google.com/products/auth",
    "OneSignal": "https://onesignal.com/",
    "App Center": "https://appcenter.ms/",
    "Branch.io": "https://branch.io/",
    "Fastlane": "https://fastlane.tools/",
    "Sentry Mobile": "https://sentry.io/for/mobile/",
    "Amplitude": "https://amplitude.com/",
    "Mixpanel": "https://mixpanel.com/",
    
    # Edge Computing & Hardware
    "NVIDIA Jetson": "https://developer.nvidia.com/embedded-computing",
    "Raspberry Pi 5": "https://raspberrypi.com/",
    "Arduino": "https://arduino.cc/",
    "WASM": "https://webassembly.org/",
    "Cloudflare Workers": "https://workers.cloudflare.com/",
    "Vercel Edge": "https://vercel.com/docs/functions/edge-functions",
    "AWS Lambda@Edge": "https://aws.amazon.com/lambda/edge/",
    "Bun": "https://bun.sh/",
    "Deno": "https://deno.land/",
    "Akamai": "https://akamai.com/",
    "Fastly": "https://fastly.com/",
    "Tailscale": "https://tailscale.com/",
    "OpenWRT": "https://openwrt.org/",
    "ESP32": "https://espressif.com/en/products/socs/esp32",
    "TensorFlow Lite": "https://tensorflow.org/lite",
    "ONNX Runtime": "https://onnxruntime.ai/",
    "CoreML": "https://developer.apple.com/machine-learning/core-ml/",
    "MNN": "https://github.com/alibaba/MNN",
    "NCNN": "https://github.com/Tencent/ncnn",
    "TNN": "https://github.com/Tencent/TNN",
    
    # Cloud Platforms & Hosting
    "AWS": "https://aws.amazon.com/",
    "Google Cloud": "https://cloud.google.com/",
    "Azure": "https://azure.microsoft.com/",
    "Vercel": "https://vercel.com/",
    "Netlify": "https://netlify.com/",
    "DigitalOcean": "https://digitalocean.com/",
    "Hetzner": "https://hetzner.com/",
    "Railway": "https://railway.app/",
    "Fly.io": "https://fly.io/",
    "Render": "https://render.com/",
    "Linode": "https://linode.com/",
    "Cloudflare": "https://cloudflare.com/",
    "Appwrite": "https://appwrite.io/",
    "Firebase": "https://firebase.google.com/",
    "CoreWeave": "https://coreweave.com/",
    "Lambda Labs": "https://lambdalabs.com/",
    "Paperspace": "https://paperspace.com/",
    "Oracle Cloud": "https://oracle.com/cloud/",
    
    # Infrastructure & IaC
    "Terraform": "https://terraform.io/",
    "Pulumi": "https://pulumi.com/",
    "Ansible": "https://ansible.com/",
    "Kubernetes": "https://kubernetes.io/",
    "Docker": "https://docker.com/",
    "Helm": "https://helm.sh/",
    "Crossplane": "https://crossplane.io/",
    "ArgoCD": "https://argoproj.github.io/cd/",
    "Nomad": "https://nomadproject.io/",
    "OpenTofu": "https://opentofu.org/",
    "CloudFormation": "https://aws.amazon.com/cloudformation/",
    "Bicep": "https://github.com/Azure/bicep",
    "Cilium": "https://cilium.io/",
    "Istio": "https://istio.io/",
    "Linkerd": "https://linkerd.io/",
    "K3s": "https://k3s.io/",
    "Portainer": "https://portainer.io/",
    "Traefik": "https://traefik.io/",
    "Nginx": "https://nginx.com/",
    "Envoy": "https://envoyproxy.io/",
    
    # CI/CD & Automation
    "GitHub Actions": "https://github.com/features/actions",
    "GitLab CI": "https://docs.gitlab.com/ee/ci/",
    "CircleCI": "https://circleci.com/",
    "Jenkins": "https://jenkins.io/",
    "Buildkite": "https://buildkite.com/",
    "Tekton": "https://tekton.dev/",
    "Dagger": "https://dagger.io/",
    "Earthly": "https://earthly.dev/",
    "Bitbucket Pipelines": "https://bitbucket.org/product/features/pipelines",
    "Azure Pipelines": "https://azure.microsoft.com/services/devops/pipelines/",
    "Nix": "https://nixos.org/",
    "Homebrew": "https://brew.sh/",
    "ASDF": "https://asdf-vm.com/",
    "Mise": "https://mise.jdx.dev/",
    "Taskfile": "https://taskfile.dev/",
    "Makefile": "https://gnu.org/software/make/",
    "Pre-commit": "https://pre-commit.com/",
    "Semantic Release": "https://semantic-release.gitbook.io/",
    "Renovate": "https://renovatebot.com/",
    "Dependabot": "https://github.com/dependabot",
    
    # Observability & Monitoring
    "Datadog": "https://datadoghq.com/",
    "Grafana": "https://grafana.com/",
    "Prometheus": "https://prometheus.io/",
    "New Relic": "https://newrelic.com/",
    "Sentry": "https://sentry.io/",
    "OpenTelemetry": "https://opentelemetry.io/",
    "LogRocket": "https://logrocket.com/",
    "Honeycomb": "https://honeycomb.io/",
    "BetterStack": "https://betterstack.com/",
    "Axiom": "https://axiom.co/",
    "Loki": "https://grafana.com/oss/loki/",
    "Tempo": "https://grafana.com/oss/tempo/",
    "Jaeger": "https://jaegertracing.io/",
    "Vector": "https://vector.dev/",
    "Highlight.io": "https://highlight.io/",
    "Checkly": "https://checklyhq.com/",
    "Uptime Kuma": "https://uptime.kuma.pet/",
    "HyperDX": "https://hyperdx.io/",
    "Baselime": "https://baselime.io/",
    "Middleware": "https://middleware.io/",
    
    # Security & Identity
    "Auth0": "https://auth0.com/",
    "Clerk": "https://clerk.com/",
    "Kinde": "https://kinde.com/",
    "Supabase Auth": "https://supabase.com/auth",
    "Okta": "https://okta.com/",
    "Vault": "https://vaultproject.io/",
    "Snyk": "https://snyk.io/",
    "Wiz": "https://wiz.io/",
    "Trivy": "https://trivy.dev/",
    "Cloudflare Access": "https://cloudflare.com/products/zero-trust/access/",
    "Boundary": "https://boundaryproject.io/",
    "Teleport": "https://goteleport.com/",
    "1Password": "https://1password.com/",
    "Bitwarden": "https://bitwarden.com/",
    "SonarQube": "https://sonarqube.org/",
    "Checkmarx": "https://checkmarx.com/",
    "Burp Suite": "https://portswigger.net/burp",
    "OWASP ZAP": "https://zaproxy.org/",
    
    # API Ecosystem
    "Postman": "https://postman.com/",
    "Insomnia": "https://insomnia.rest/",
    "GraphQL": "https://graphql.org/",
    "Apollo": "https://apollographql.com/",
    "tRPC": "https://trpc.io/",
    "gRPC": "https://grpc.io/",
    "ConnectRPC": "https://connectrpc.com/",
    "Swagger/OpenAPI": "https://swagger.io/",
    "Scalar": "https://scalar.com/",
    "Stoplight": "https://stoplight.io/",
    "Kong": "https://konghq.com/",
    "Tyk": "https://tyk.io/",
    "Apigee": "https://cloud.google.com/apigee",
    "Zuplo": "https://zuplo.com/",
    "Hoppscotch": "https://hoppscotch.io/",
    "Bruno": "https://usebruno.com/",
    "Speakeasy": "https://speakeasy.com/",
    "Fern": "https://buildwithfern.com/",
    "Liblab": "https://liblab.com/",
    "Stainless": "https://stainlessapi.com/",
    
    # Data Science & Pipelines
    "Airflow": "https://airflow.apache.org/",
    "Dagster": "https://dagster.io/",
    "Prefect": "https://prefect.io/",
    "dbt": "https://getdbt.com/",
    "Pandas": "https://pandas.pydata.org/",
    "Polars": "https://pola.rs/",
    "Jupyter": "https://jupyter.org/",
    "DuckDB": "https://duckdb.org/",
    "Apache Spark": "https://spark.apache.org/",
    "Ray": "https://ray.io/",
    "Dask": "https://dask.org/",
    "Airbyte": "https://airbyte.com/",
    "Fivetran": "https://fivetran.com/",
    "Meltano": "https://meltano.com/",
    "Iceberg": "https://iceberg.apache.org/",
    "Delta Lake": "https://delta.io/",
    "Trino": "https://trino.io/",
    "Presto": "https://prestodb.io/",
    "Superset": "https://superset.apache.org/",
    "Metabase": "https://metabase.com/",
    
    # Testing & Quality Assurance
    "Playwright": "https://playwright.dev/",
    "Cypress": "https://cypress.io/",
    "Vitest": "https://vitest.dev/",
    "Jest": "https://jestjs.io/",
    "Pytest": "https://pytest.org/",
    "Testing Library": "https://testing-library.com/",
    "Percy": "https://percy.io/",
    "Chromatic": "https://chromatic.com/",
    "Mock Service Worker": "https://mswjs.io/",
    "Artillery": "https://artillery.io/",
    "K6": "https://k6.io/",
    "Locust": "https://locust.io/",
    "Postman Tests": "https://learning.postman.com/docs/writing-scripts/test-scripts/",
    "Appium": "https://appium.io/",
    "Maestro": "https://maestro.mobile.dev/",
    "Robot Framework": "https://robotframework.org/",
    "Cucumber": "https://cucumber.io/",
    "Tox": "https://tox.wiki/",
    
    # Collaboration & Productivity
    "Slack": "https://slack.com/",
    "Discord": "https://discord.com/",
    "Notion": "https://notion.so/",
    "Linear": "https://linear.app/",
    "Jira": "https://atlassian.com/software/jira",
    "GitHub": "https://github.com/",
    "GitLab": "https://gitlab.com/",
    "Zoom": "https://zoom.us/",
    "Around": "https://around.co/",
    "Miro": "https://miro.com/",
    "Figma": "https://figma.com/",
    "Canva": "https://canva.com/",
    "Loom": "https://loom.com/",
    "Calendly": "https://calendly.com/",
    "Tally": "https://tally.so/",
    "Posthog": "https://posthog.com/",
    "Google Analytics": "https://analytics.google.com/",
    "Segment": "https://segment.com/"
}

# Tech Stack Categories with items
TECH_STACK = [
    {
        "id": "vision",
        "title": "Vision AI & Computer Vision",
        "icon": "fa-camera",
        "items": ["YOLO v11", "MediaPipe", "OpenCV", "PyTorch", "TensorRT", "Detectron2", "DeepStream", "Roboflow", "SAM 2", "Ultralytics", "MMDetection", "Tesseract", "FFmpeg", "GStreamer", "Albumentations", "HuggingFace Vision", "ClearML", "DVC", "Label Studio", "FiftyOne"]
    },
    {
        "id": "gen-video",
        "title": "Generative Video & Creative AI",
        "icon": "fa-film",
        "items": ["Sora API", "Runway Gen-3", "Luma Dream Machine", "Stable Video Diffusion", "Pika Labs", "HeyGen", "Synthesia", "Kaiber", "Leonardo.ai", "Midjourney", "DALL-E 3", "ComfyUI", "Automatic1111", "ControlNet", "AnimateDiff", "EbSynth", "Topaz Labs", "ElevenLabs", "Sunno", "Udios"]
    },
    {
        "id": "llm",
        "title": "Foundation Models & AI Stack",
        "icon": "fa-brain",
        "items": ["GPT-5 (o1)", "Claude Sonnet 4.6", "Gemini 1.5 Pro", "Llama 3.1", "Mistral Large", "DeepSeek V3", "LangChain", "LlamaIndex", "AutoGPT", "CrewAI", "Microsoft Autogen", "vLLM", "Ollama", "Groq", "Together AI", "DeepL", "LangSmith", "Weights & Biases", "PromptLayer", "DSPy"]
    },
    {
        "id": "voice",
        "title": "Voice AI & Conversational Agents",
        "icon": "fa-microphone",
        "items": ["ElevenLabs", "Bland AI", "Retell AI", "Vapi", "Deepgram", "AssemblyAI", "Speechmatics", "Whisper API", "Play.ht", "Murf AI", "Resemble AI", "WellSaid Labs", "Voiceflow", "Botpress", "Synthflow", "Air AI", "Sonos", "Hume AI", "Rime", "Cartesia"]
    },
    {
        "id": "vector",
        "title": "Vector Databases & RAG",
        "icon": "fa-database",
        "items": ["Pinecone", "Milvus", "Qdrant", "Weaviate", "ChromaDB", "Zilliz", "Elasticsearch", "Vespa", "Faiss", "LanceDB", "SurrealDB", "Pgvector", "Voyage AI", "Cohere Embed", "Voyage Embed", "Nomic AI", "Unstructured.io", "RAGFlow", "Verba", "Haystack"]
    },
    {
        "id": "database",
        "title": "Structured & Real-time Data",
        "icon": "fa-server",
        "items": ["PostgreSQL 17", "MongoDB", "Redis Stack", "ClickHouse", "TiDB", "CockroachDB", "ScyllaDB", "SurrealDB", "Neo4j", "TimescaleDB", "Snowflake", "BigQuery", "Supabase", "PlanetScale", "Neon", "EdgeDB", "Meilisearch", "Typesense", "InfluxDB", "Couchbase"]
    },
    {
        "id": "streaming",
        "title": "Messaging & Event Streaming",
        "icon": "fa-bolt",
        "items": ["Apache Kafka", "Redpanda", "RabbitMQ", "NATS", "Apache Pulsar", "AWS Kinesis", "Confluent", "Upstash", "Ably", "Pusher", "Socket.io", "Centrifugo", "Temporal.io", "Apache Flink", "Benthos", "Vector.dev", "Logstash", "Fluentd", "StreamNative", "WarpStream"]
    },
    {
        "id": "languages",
        "title": "Core Programming Languages",
        "icon": "fa-code",
        "items": ["Rust", "Python 3.13", "TypeScript 5.x", "Go", "C++ 23", "Java 21", "Swift (SwiftUI)", "Kotlin", "Zig", "Mojo", "SQL", "Elixir", "C#", "Dart", "PHP 8.4", "Ruby 3.3", "Scala", "Haskell", "Bash"]
    },
    {
        "id": "backend",
        "title": "Backend Frameworks",
        "icon": "fa-gears",
        "items": ["Next.js 16", "FastAPI", "Axum (Rust)", "Gin (Go)", "NestJS", "Django", "Spring Boot", "Laravel", "ElysiaJS", "Hono", "Go Buffalo", "Actix", "Ruby on Rails", "Fiber", "AdonisJS", "Fastify", "Koa", "Rocket", "Quarkus", "Micronaut"]
    },
    {
        "id": "frontend",
        "title": "Frontend & UI Engineering",
        "icon": "fa-desktop",
        "items": ["React 19", "Vue 3", "SvelteKit", "Tailwind CSS", "Shadcn UI", "Framer Motion", "Three.js", "D3.js", "TanStack Query", "Zustand", "Redux Toolkit", "Radix UI", "Lucide Icons", "PostCSS", "Vite", "Turbopack", "Astro", "SolidJS", "Qwik", "Storybook"]
    },
    {
        "id": "mobile",
        "title": "Mobile & Edge App Dev",
        "icon": "fa-mobile-screen",
        "items": ["React Native", "Flutter", "Expo", "SwiftUI", "Jetpack Compose", "Capacitor", "Ionic", "Tamagui", "NativeScript", "Appflow", "Codemagic", "RevenueCat", "Firebase Auth", "OneSignal", "App Center", "Branch.io", "Fastlane", "Sentry Mobile", "Amplitude", "Mixpanel"]
    },
    {
        "id": "edge",
        "title": "Edge Computing & Hardware",
        "icon": "fa-microchip",
        "items": ["NVIDIA Jetson", "Raspberry Pi 5", "Arduino", "WASM", "Cloudflare Workers", "Vercel Edge", "AWS Lambda@Edge", "Bun", "Deno", "Akamai", "Fastly", "Tailscale", "OpenWRT", "ESP32", "TensorFlow Lite", "ONNX Runtime", "CoreML", "MNN", "NCNN", "TNN"]
    },
    {
        "id": "cloud",
        "title": "Cloud Platforms & Hosting",
        "icon": "fa-cloud",
        "items": ["AWS", "Google Cloud", "Azure", "Vercel", "Netlify", "DigitalOcean", "Hetzner", "Railway", "Fly.io", "Render", "Linode", "Cloudflare", "Appwrite", "Firebase", "CoreWeave", "Lambda Labs", "Paperspace", "Oracle Cloud"]
    },
    {
        "id": "devops",
        "title": "Infrastructure & IaC",
        "icon": "fa-network-wired",
        "items": ["Terraform", "Pulumi", "Ansible", "Kubernetes", "Docker", "Helm", "Crossplane", "ArgoCD", "Nomad", "OpenTofu", "CloudFormation", "Bicep", "Cilium", "Istio", "Linkerd", "K3s", "Portainer", "Traefik", "Nginx", "Envoy"]
    },
    {
        "id": "cicd",
        "title": "CI/CD & Automation",
        "icon": "fa-sync",
        "items": ["GitHub Actions", "GitLab CI", "CircleCI", "Jenkins", "Buildkite", "Tekton", "Dagger", "Earthly", "Bitbucket Pipelines", "Azure Pipelines", "Nix", "Homebrew", "ASDF", "Mise", "Taskfile", "Makefile", "Pre-commit", "Semantic Release", "Renovate", "Dependabot"]
    },
    {
        "id": "observability",
        "title": "Observability & Monitoring",
        "icon": "fa-chart-line",
        "items": ["Datadog", "Grafana", "Prometheus", "New Relic", "Sentry", "OpenTelemetry", "LogRocket", "Honeycomb", "BetterStack", "Axiom", "Loki", "Tempo", "Jaeger", "Vector", "Highlight.io", "Checkly", "Uptime Kuma", "HyperDX", "Baselime", "Middleware"]
    },
    {
        "id": "security",
        "title": "Security & Identity",
        "icon": "fa-shield-halved",
        "items": ["Auth0", "Clerk", "Kinde", "Supabase Auth", "Okta", "Vault", "Snyk", "Wiz", "Trivy", "Cloudflare Access", "Boundary", "Teleport", "1Password", "Bitwarden", "SonarQube", "Checkmarx", "Burp Suite", "OWASP ZAP"]
    },
    {
        "id": "api",
        "title": "API Ecosystem",
        "icon": "fa-plug",
        "items": ["Postman", "Insomnia", "GraphQL", "Apollo", "tRPC", "gRPC", "ConnectRPC", "Swagger/OpenAPI", "Scalar", "Stoplight", "Kong", "Tyk", "Apigee", "Zuplo", "Hoppscotch", "Bruno", "Speakeasy", "Fern", "Liblab", "Stainless"]
    },
    {
        "id": "data-eng",
        "title": "Data Science & Pipelines",
        "icon": "fa-vials",
        "items": ["Airflow", "Dagster", "Prefect", "dbt", "Pandas", "Polars", "Jupyter", "DuckDB", "Apache Spark", "Ray", "Dask", "Airbyte", "Fivetran", "Meltano", "Iceberg", "Delta Lake", "Trino", "Presto", "Superset", "Metabase"]
    },
    {
        "id": "testing",
        "title": "Testing & Quality Assurance",
        "icon": "fa-check-double",
        "items": ["Playwright", "Cypress", "Vitest", "Jest", "Pytest", "Testing Library", "Percy", "Chromatic", "Mock Service Worker", "Artillery", "K6", "Locust", "Postman Tests", "Appium", "Maestro", "Robot Framework", "Cucumber", "Tox"]
    },
    {
        "id": "business",
        "title": "Collaboration & Productivity",
        "icon": "fa-briefcase",
        "items": ["Slack", "Discord", "Notion", "Linear", "Jira", "GitHub", "GitLab", "Zoom", "Around", "Miro", "Figma", "Canva", "Loom", "Calendly", "Tally", "Posthog", "Google Analytics", "Segment"]
    }
]


def slugify(name: str) -> str:
    """Convert name to URL-friendly slug"""
    return re.sub(r'[^\w\s-]', '', name).strip().lower().replace(' ', '-')


def extract_favicon_domain(url: str) -> str:
    """Extract domain for favicon from URL"""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return parsed.netloc
    except:
        return slugify(url) + ".com"


def generate_sql_inserts() -> str:
    """Generate SQL INSERT statements for all technologies"""
    sql_lines = ["-- VidiSmart Tech Stack Data Migration", "-- Generated:", ""]
    
    # Insert technologies
    sql_lines.append("-- Insert Technologies")
    sql_lines.append("INSERT INTO technologies (id, name, slug, url, favicon_domain, category_id, is_active, popularity_score) VALUES")
    
    values = []
    tech_count = 0
    
    for category in TECH_STACK:
        category_id = category["id"]
        for item in category["items"]:
            tech_id = str(uuid.uuid4())
            name = item.replace("'", "''")  # Escape single quotes
            slug = slugify(item)
            url = TECH_URLS.get(item, f"https://www.google.com/search?q={slug}")
            favicon_domain = extract_favicon_domain(url)
            
            values.append(f"    ('{tech_id}', '{name}', '{slug}', '{url}', '{favicon_domain}', '{category_id}', TRUE, {100 - tech_count})")
            tech_count += 1
    
    sql_lines.append(",\n".join(values) + ";")
    sql_lines.append(f"\n-- Total technologies inserted: {tech_count}")
    
    return "\n".join(sql_lines)


def generate_json_export() -> dict:
    """Generate JSON export for API consumption"""
    export = {
        "metadata": {
            "version": "3.0",
            "generated_at": datetime.now().isoformat(),
            "total_categories": len(TECH_STACK),
            "total_technologies": sum(len(cat["items"]) for cat in TECH_STACK)
        },
        "categories": []
    }
    
    for category in TECH_STACK:
        cat_data = {
            "id": category["id"],
            "title": category["title"],
            "icon": category["icon"],
            "technologies": []
        }
        
        for item in category["items"]:
            url = TECH_URLS.get(item, f"https://www.google.com/search?q={slugify(item)}")
            cat_data["technologies"].append({
                "id": str(uuid.uuid4()),
                "name": item,
                "slug": slugify(item),
                "url": url,
                "favicon_domain": extract_favicon_domain(url)
            })
        
        export["categories"].append(cat_data)
    
    return export


def generate_supabase_seed() -> str:
    """Generate Supabase seed.sql file"""
    lines = ["-- Supabase Seed for VidiSmart Tech Stack", ""]
    
    # Categories
    lines.append("-- Categories")
    lines.append("INSERT INTO categories (id, title, icon, display_order) VALUES")
    cat_values = []
    for i, cat in enumerate(TECH_STACK, 1):
        cat_values.append(f"    ('{cat['id']}', '{cat['title']}', '{cat['icon']}', {i})")
    lines.append(",\n".join(cat_values) + ";")
    lines.append("")
    
    # Technologies
    lines.append("-- Technologies")
    lines.append("INSERT INTO technologies (id, name, slug, url, favicon_domain, category_id, is_active, popularity_score) VALUES")
    
    tech_values = []
    tech_count = 0
    
    for category in TECH_STACK:
        category_id = category["id"]
        for item in category["items"]:
            tech_id = str(uuid.uuid4())
            name = item.replace("'", "''")
            slug = slugify(item)
            url = TECH_URLS.get(item, f"https://www.google.com/search?q={slug}")
            favicon_domain = extract_favicon_domain(url)
            
            tech_values.append(f"    ('{tech_id}', '{name}', '{slug}', '{url}', '{favicon_domain}', '{category_id}', TRUE, {100 - tech_count})")
            tech_count += 1
    
    lines.append(",\n".join(tech_values) + ";")
    lines.append(f"\n-- Total: {tech_count} technologies across {len(TECH_STACK)} categories")
    
    return "\n".join(lines)


def generate_api_response() -> dict:
    """Generate sample API response structure"""
    return {
        "success": True,
        "data": generate_json_export(),
        "pagination": {
            "page": 1,
            "per_page": 100,
            "total": sum(len(cat["items"]) for cat in TECH_STACK)
        }
    }


if __name__ == "__main__":
    import os
    
    # Create output directory
    os.makedirs("database/output", exist_ok=True)
    
    # Generate SQL migration
    sql_content = generate_sql_inserts()
    with open("database/output/tech_stack_data.sql", "w") as f:
        f.write(sql_content)
    print("✓ Generated: database/output/tech_stack_data.sql")
    
    # Generate JSON export
    json_content = generate_json_export()
    with open("database/output/tech_stack_data.json", "w") as f:
        json.dump(json_content, f, indent=2)
    print("✓ Generated: database/output/tech_stack_data.json")
    
    # Generate Supabase seed
    supabase_content = generate_supabase_seed()
    with open("database/output/supabase_seed.sql", "w") as f:
        f.write(supabase_content)
    print("✓ Generated: database/output/supabase_seed.sql")
    
    # Generate API response sample
    api_content = generate_api_response()
    with open("database/output/api_response_sample.json", "w") as f:
        json.dump(api_content, f, indent=2)
    print("✓ Generated: database/output/api_response_sample.json")
    
    print(f"\n✅ Migration complete! Total technologies: {sum(len(cat['items']) for cat in TECH_STACK)}")
