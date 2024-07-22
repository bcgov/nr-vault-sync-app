vault {
  renew_token = false
  retry {
    enabled = false
    attempts = 12
    backoff = "250ms"
    max_backoff = "1m"
  }
}
secret {
  no_prefix = true
  path = "apps/prod/vault/vsync"
}
exec {
  splay = "0s"
  env {
    pristine = false
  }
  kill_timeout = "5s"
}
