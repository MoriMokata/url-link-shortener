namespace Gulfy.Domain;

/// <summary>
/// Thrown when an operation would violate a domain invariant (e.g. constructing
/// a ShortLink with a missing short code). Application-level validation — like
/// "is this string a well-formed URL" — belongs in Gulfy.Application, not here;
/// this exception is reserved for invariants the entity itself must guarantee.
/// </summary>
public sealed class DomainException(string message) : Exception(message);
