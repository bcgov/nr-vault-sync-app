# Audit hash
# Scope: Users and applications with a need to calculate the hash of data
# Note: Access to this path will allow someone to map known possible values to
# their hash. Only trusted entities should have access.
# Warning: This policy is referenced by name. Ensure changes do not break references
# or character of this policy.

# Allow checking of hash values (post)
path "/sys/audit-hash/+" {
    capabilities = ["update"]
}
