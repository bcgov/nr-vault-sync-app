# Audit hash admin Policy
# Scope: Users and applications with a need to calculate the hash of data
# Note: Access to this path will allow someone to map well known data to their hash. Only trusted entities should have access.

# Allow create tokens
path "/sys/audit-hash/+" {
    capabilities = ["update"]
}
