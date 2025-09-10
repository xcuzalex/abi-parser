use std::fs;
use std::path::Path;

/// Read and validate ABI file content
/// 
/// # Arguments
/// * `file_path` - Path to the ABI JSON file
/// 
/// # Returns
/// * `Result<String, String>` - File content on success, error message on failure
pub fn read_abi_file<P: AsRef<Path>>(file_path: P) -> Result<String, String> {
    let path = file_path.as_ref();
    
    // Check if file exists
    if !path.exists() {
        return Err(format!("File does not exist: {}", path.display()));
    }

    // Check if it's a file (not a directory)
    if !path.is_file() {
        return Err(format!("Path is not a file: {}", path.display()));
    }

    // Read file content
    fs::read_to_string(path).map_err(|e| format!("Failed to read file: {}", e))
}

/// Write output to a file
/// 
/// # Arguments
/// * `file_path` - Path where to write the output
/// * `content` - Content to write to the file
/// 
/// # Returns
/// * `Result<(), String>` - Success or error message
pub fn write_output_file<P: AsRef<Path>>(file_path: P, content: &str) -> Result<(), String> {
    let path = file_path.as_ref();
    
    // Create parent directory if it doesn't exist
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }
    }

    // Write content to file
    fs::write(path, content).map_err(|e| format!("Failed to write file: {}", e))
}

/// Generate output file path based on input file path
/// 
/// # Arguments
/// * `input_path` - The input file path
/// * `suffix` - Suffix to add before the extension (default: "_stats")
/// 
/// # Returns
/// * `String` - The generated output file path
pub fn generate_output_path(input_path: &str, suffix: Option<&str>) -> String {
    let suffix = suffix.unwrap_or("_stats");
    
    if input_path.ends_with(".json") {
        input_path.replace(".json", &format!("{}.json", suffix))
    } else {
        format!("{}{}.json", input_path, suffix)
    }
}
