# List namespaces
path "sys/namespaces/*" {
   capabilities = ["read", "list"]
}

# Adobe/cryptr support
path "sys/policy/*" {
    policy = "read"
}
