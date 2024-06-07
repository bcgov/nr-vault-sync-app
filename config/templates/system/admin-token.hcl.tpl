# Token admin Policy
# Scope: Users and applications with a need to create orphan tokens

# Allow create tokens
path "auth/token/create" {
    capabilities = ["update"]
}

# Allow creation of orphan tokens
path "auth/token/create-orphan" {
    capabilities = ["update"]
}
