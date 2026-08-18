namespace Gulfy.Application.Exceptions;

/// <summary>Thrown when a requested custom alias is already taken. Maps to 409.</summary>
public sealed class ShortCodeConflictException(string code) : Exception($"Short code '{code}' is already in use.");
