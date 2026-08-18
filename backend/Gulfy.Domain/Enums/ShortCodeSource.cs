namespace Gulfy.Domain.Enums;

/// <summary>
/// Which strategy produced a ShortLink's short code. Kept on the entity so the
/// API/UI can show provenance (e.g. an "Auto-generated" vs "Custom alias" badge)
/// without re-deriving it. New generation strategies (task BE-04, e.g. a
/// dictionary-word generator) should extend this enum.
/// </summary>
public enum ShortCodeSource
{
    Auto = 0,
    CustomAlias = 1,
}
