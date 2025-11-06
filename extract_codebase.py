import os
import fnmatch

# --- Configuration ---
PROJECT_ROOT = "."  # Default to current directory. Change if needed.
OUTPUT_FILE = "codebase.txt"
TIKTOKEN_ENCODING_NAME = "cl100k_base" # Encoding for models like gpt-3.5-turbo, gpt-4

# Attempt to import tiktoken
try:
    import tiktoken # type: ignore
    tiktoken_available = True
    try:
        tokenizer = tiktoken.get_encoding(TIKTOKEN_ENCODING_NAME)
    except Exception as e:
        print(f"Warning: tiktoken is imported, but could not load encoding '{TIKTOKEN_ENCODING_NAME}'. Falling back to word count. Error: {e}")
        tiktoken_available = False
        tokenizer = None
except ImportError:
    print("Warning: 'tiktoken' library not found. Falling back to word count for token estimation.")
    print("You can install it with: pip install tiktoken")
    tiktoken_available = False
    tokenizer = None

# Patterns for directories/files to always ignore (Gitignore-style syntax)
DEFAULT_IGNORE_PATTERNS = [
    ".git/",
    "node_modules/",
    ".next/",
    "__pycache__/",
    "build/",
    "dist/",
    "*.pyc",
    "*.DS_Store",
    "Thumbs.db",
    "countryData.ts",
    # User-specified types and files from example
    "*.svg",
    "*.md",
    "*.ico",
    "*.otf",
    "package-lock.json",
    "pnpm-lock.yaml",
    "tsconfig.tsbuildinfo",
    ".qodo",
    ".rooignore",
    "extract_codebase.py",

    # Exclude test files
    "**/__tests__/*",

    # Common binary file types to exclude content from
    "*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp",
    "*.mp3", "*.mp4", "*.avi", "*.mov",
    "*.pdf", "*.doc", "*.docx", "*.xls", "*.xlsx", "*.ppt", "*.pptx",
    "*.zip", "*.tar", "*.gz", "*.rar",
    "*.exe", "*.dll", "*.so", "*.dylib",
    "*.woff", "*.woff2", "*.eot", "*.ttf",
    "*.lockb"
]

# File extensions (and specific filenames) to consider as text and include content for.
TEXT_FILE_EXTENSIONS_OR_NAMES = {
    ".tsx", ".ts", ".js", ".jsx", ".css", ".html", ".htm", ".json",
    ".yaml", ".yml", ".toml", ".ini", ".cfg", ".conf",
    ".py", ".sh", ".bash", ".zsh", ".c", ".cpp", ".h", ".hpp", ".java",
    ".cs", ".go", ".rb", ".php", ".pl", ".mjs", ".txt", ".xml",
    ".env", "LICENSE", "Dockerfile",
    ".gitignore"
}
# --- End Configuration ---

def count_tokens(text_content):
    """Counts tokens using tiktoken if available, otherwise falls back to word count."""
    if tiktoken_available and tokenizer:
        try:
            return len(tokenizer.encode(text_content))
        except Exception as e:
            print(f"Error during tiktoken encoding (falling back to word count for this content): {e}")
            return len(text_content.split())
    else:
        return len(text_content.split())

def load_gitignore_patterns(root_path):
    """Loads patterns from .gitignore file in the root_path."""
    gitignore_path = os.path.join(root_path, ".gitignore")
    patterns = []
    if os.path.exists(gitignore_path):
        try:
            with open(gitignore_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        patterns.append(line)
        except Exception as e:
            print(f"Warning: Could not read .gitignore: {e}")
    return patterns

def is_path_ignored(path_rel_to_root, all_ignore_patterns, root_dir_abs):
    """
    Checks if a given path (relative to project root) should be ignored.
    """
    normalized_path_rel = path_rel_to_root.replace(os.sep, '/')
    item_abs_path = os.path.join(root_dir_abs, path_rel_to_root)
    # This check needs the absolute path.
    # Be careful if path_rel_to_root can be empty or just a filename without dir context.
    # For this function, path_rel_to_root is expected to be a full relative path from project root.
    try:
        is_item_a_directory = os.path.isdir(item_abs_path)
    except OSError: # Handle cases like path too long or other OS errors
        is_item_a_directory = False # Assume not a directory if check fails

    for pattern in all_ignore_patterns:
        p_norm = pattern.replace(os.sep, '/')
        
        if p_norm.endswith('/'):
            dir_pattern = p_norm.rstrip('/')
            # Pattern like "/node_modules/" or "node_modules/"
            if p_norm.startswith('/'): # Anchored to root
                # Matches if normalized_path_rel is "dir_pattern" (and it's a dir)
                # or starts with "dir_pattern/"
                if (normalized_path_rel == dir_pattern and is_item_a_directory) or \
                   normalized_path_rel.startswith(dir_pattern + '/'):
                    return True
            else: # Not anchored (e.g., "build/")
                # Matches "build" if it's a dir, or "build/foo", or "src/build/foo"
                if (normalized_path_rel == dir_pattern and is_item_a_directory) or \
                   normalized_path_rel.startswith(dir_pattern + '/') or \
                   (('/' + dir_pattern + '/') in ('/' + normalized_path_rel + '/')): # Ensure matches full component
                    # Check if the matched segment is actually a directory
                    # This is to avoid 'somebuild/' matching 'build/' pattern incorrectly if 'somebuild' is a file.
                    # More robust check for component matching:
                    path_components = normalized_path_rel.split('/')
                    if dir_pattern in path_components:
                        # Construct path to the component and check if it's a dir
                        try:
                            temp_path_to_check = ""
                            for i, comp in enumerate(path_components):
                                temp_path_to_check = os.path.join(temp_path_to_check, comp) if temp_path_to_check else comp
                                if comp == dir_pattern:
                                    # Check if this component is indeed a directory at this path
                                    if os.path.isdir(os.path.join(root_dir_abs, temp_path_to_check)):
                                        return True
                                    break # No need to check further down this path if this component isn't the dir
                        except Exception: # os.path.isdir might fail
                            pass
        # Handle file patterns and general wildcards (patterns not ending with '/')
        else:
            if '/' not in p_norm: # e.g., "*.log", "foo.txt"
                if fnmatch.fnmatch(os.path.basename(normalized_path_rel), p_norm):
                    return True
            else: # e.g., "src/*.js", "/config.ini"
                if p_norm.startswith('/'): # Anchored to root
                    if fnmatch.fnmatch(normalized_path_rel, p_norm.lstrip('/')):
                        return True
                else: # Relative to current directory level in gitignore context (simplified for fnmatch)
                      # fnmatch will match 'lib/utils.js' with 'lib/utils.js'
                      # For '**/lib/utils.js' type matching, gitignore is more complex.
                      # fnmatch also handles 'lib/**/*.js' against 'lib/foo/bar.js'
                    if fnmatch.fnmatch(normalized_path_rel, p_norm):
                        return True
                    # A common gitignore behavior: if a pattern contains '/' but doesn't start with '/',
                    # it can match at any level. fnmatch needs a '*' prefix for this.
                    if fnmatch.fnmatch(normalized_path_rel, '*/' + p_norm):
                         return True
    return False

def get_folder_structure_and_files(root_path, all_ignore_patterns):
    """
    Generates the folder structure string and a list of files to process.
    Returns (structure_string, list_of_absolute_file_paths_to_include).
    """
    structure_lines = []
    files_to_include_content = []
    abs_root_path = os.path.abspath(root_path)

    structure_lines.append(f"{os.path.basename(abs_root_path)}/")

    for dirpath, dirnames, filenames in os.walk(abs_root_path, topdown=True):
        rel_dirpath = os.path.relpath(dirpath, abs_root_path)
        if rel_dirpath == ".":
            rel_dirpath = ""

        # Filter dirnames in-place to prevent os.walk from traversing into them
        dirs_to_keep = []
        original_dirnames = list(dirnames) # Iterate over a copy
        for d_name in sorted(original_dirnames):
            path_to_check_dir_rel = os.path.join(rel_dirpath, d_name) if rel_dirpath else d_name
            if not is_path_ignored(path_to_check_dir_rel, all_ignore_patterns, abs_root_path):
                dirs_to_keep.append(d_name)
            # else:
                # print(f"Ignoring directory: {path_to_check_dir_rel}") # For debugging
        dirnames[:] = dirs_to_keep


        level = rel_dirpath.count(os.sep) if rel_dirpath else -1

        if rel_dirpath:
            indent = "│   " * level + "├── "
            structure_lines.append(f"{indent}{os.path.basename(dirpath)}/")
        
        for f_name in sorted(filenames):
            path_to_check_file_rel = os.path.join(rel_dirpath, f_name) if rel_dirpath else f_name
            
            if not is_path_ignored(path_to_check_file_rel, all_ignore_patterns, abs_root_path):
                sub_indent = "│   " * (level + 1) + "├── "
                structure_lines.append(f"{sub_indent}{f_name}")
                files_to_include_content.append(os.path.join(dirpath, f_name))
            # else:
                # print(f"Ignoring file: {path_to_check_file_rel}") # For debugging


    return "\n".join(structure_lines), files_to_include_content

def main():
    abs_project_root = os.path.abspath(PROJECT_ROOT)
    print(f"Processing project root: {abs_project_root}")

    gitignore_pats = load_gitignore_patterns(abs_project_root)
    all_ignores = sorted(list(set(DEFAULT_IGNORE_PATTERNS + gitignore_pats)))
    # print(f"Combined ignore patterns: {all_ignores}") # For debugging

    folder_structure_str, files_for_content_extraction = get_folder_structure_and_files(abs_project_root, all_ignores)

    print(f"Found {len(files_for_content_extraction)} files/folders listed in structure (after all ignores).")

    total_tokens_processed = 0
    content_extracted_count = 0

    # Delete the output file if it already exists
    if os.path.exists(OUTPUT_FILE):
        print(f"Deleting existing {OUTPUT_FILE}")
        os.remove(OUTPUT_FILE)

    with open(OUTPUT_FILE, "w", encoding="utf-8", errors="replace") as cb_file:
        cb_file.write("Project Root: " + abs_project_root + "\n\n")
        cb_file.write("Folder Structure:\n")
        cb_file.write("=================\n")
        cb_file.write(folder_structure_str)
        cb_file.write("\n\n\n")
        cb_file.write("File Contents:\n")
        cb_file.write("==============\n")

        for filepath_abs in files_for_content_extraction:
            filepath_rel_to_root = os.path.relpath(filepath_abs, abs_project_root)
            display_filepath_rel = filepath_rel_to_root.replace(os.sep, '/')
            
            _, ext = os.path.splitext(filepath_rel_to_root)
            filename_only = os.path.basename(filepath_rel_to_root)

            is_text_file_to_include = (ext.lower() in TEXT_FILE_EXTENSIONS_OR_NAMES or 
                                       filename_only in TEXT_FILE_EXTENSIONS_OR_NAMES)

            if is_text_file_to_include:
                file_content = ""
                file_tokens = 0
                try:
                    with open(filepath_abs, "r", encoding="utf-8") as f_content_reader:
                        file_content = f_content_reader.read()
                except UnicodeDecodeError:
                    try:
                        with open(filepath_abs, "r", encoding="latin-1") as f_content_reader:
                            file_content = f_content_reader.read()
                        file_content += "\n[Warning: Read with latin-1 encoding due to UTF-8 decode error]"
                    except Exception as e_fallback:
                        file_content = f"[Error reading file with fallback encoding: {e_fallback}]"
                except Exception as e:
                    file_content = f"[Error reading file: {e}]"

                file_tokens = count_tokens(file_content)
                total_tokens_processed += file_tokens
                content_extracted_count += 1

                token_label = "Tokens" if (tiktoken_available and tokenizer) else "Words (approx tokens)"
                cb_file.write(f"\n--- File: {display_filepath_rel} ({token_label}: {file_tokens}) ---\n")
                cb_file.write(file_content)
                cb_file.write(f"\n--- End of File: {display_filepath_rel} ---\n")
            else:
                # This ensures that even if a file passes .gitignore and DEFAULT_IGNORE_PATTERNS,
                # but is not in TEXT_FILE_EXTENSIONS_OR_NAMES, its content is skipped
                # but it's still acknowledged in the output file.
                cb_file.write(f"\n--- File (content skipped, not in TEXT_FILE_EXTENSIONS_OR_NAMES): {display_filepath_rel} ---\n")

        # The summary section is NOT written to the file anymore.
        # It will only be printed to the console below.

    print(f"\nCodebase context written to {OUTPUT_FILE}")
    print("-------------------- SUMMARY --------------------")
    print(f"Project Root: {abs_project_root}")
    print(f"Total files/folders listed in structure (after ignores): {len(files_for_content_extraction)}")
    print(f"Number of files with content extracted: {content_extracted_count}")

    token_summary_label_console = "Total Tokens Processed" if (tiktoken_available and tokenizer) else "Total Words Processed (approx tokens)"
    encoding_info_console = f" (using tiktoken encoding: '{TIKTOKEN_ENCODING_NAME}')" if (tiktoken_available and tokenizer) else " (tiktoken not available or encoding load failed, using word count)"
    print(f"{token_summary_label_console}: {total_tokens_processed}{encoding_info_console}")
    print("-----------------------------------------------")


if __name__ == "__main__":
    main()