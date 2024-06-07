vault {
  address = ""
  renew_token = true
  retry {
    enabled = true
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
