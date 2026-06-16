type TextFormatOptions = {
  replaceSeparators?: boolean; // -, _, .
  trim?: boolean;
  capitalizeWords?: boolean;
  capitalizeSentence?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  capitalizeFirstOnly?: boolean;
};

export const formatText = (
  text: string | null | undefined,
  options: TextFormatOptions = {},
): string => {
  if (!text) return "";

  let result = text;

  if (options.trim !== false) {
    result = result.trim();
  }

  if (options.replaceSeparators) {
    result = result.replace(/[-_.]+/g, " ");
    result = result.replace(/\s+/g, " ");
  }

  if (options.uppercase) {
    return result.toUpperCase();
  }

  if (options.lowercase) {
    return result.toLowerCase();
  }

  if (options.capitalizeWords) {
    return result.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  if (options.capitalizeSentence) {
    return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
  }

  if (options.capitalizeFirstOnly) {
    result = result.toLowerCase();
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
};
