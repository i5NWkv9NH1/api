declare namespace NodeJS {
  interface ProcessEnv {
    POSTGRES_HOST: string
    POSTGRES_PORT: string
    POSTGRES_USER: string
    POSTGRES_PASSWORD: string
    POSTGRES_DB: string

    REDIS_HOST: string
    REDIS_PORT: string

    ELASTICSEARCH_NODE: string
  }
}
