use hex;
use tiny_keccak::{Hasher, Keccak};

/// Calculate Keccak256 hash of the input data
/// 
/// # Arguments
/// * `data` - The input data to hash
/// 
/// # Returns
/// * `[u8; 32]` - The 32-byte hash result
pub fn keccak256(data: &[u8]) -> [u8; 32] {
    let mut hasher = Keccak::v256();
    let mut output = [0u8; 32];
    hasher.update(data);
    hasher.finalize(&mut output);
    output
}

/// Generate the function selector (first 4 bytes of keccak256 hash)
/// 
/// # Arguments
/// * `signature` - The function signature string
/// 
/// # Returns
/// * `String` - The function selector in hex format with 0x prefix
pub fn get_function_selector(signature: &str) -> String {
    let hash = keccak256(signature.as_bytes());
    format!("0x{}", hex::encode(&hash[0..4]))
}

/// Generate the event topic (full keccak256 hash)
/// 
/// # Arguments
/// * `signature` - The event signature string
/// 
/// # Returns
/// * `String` - The event topic in hex format with 0x prefix
pub fn get_event_topic(signature: &str) -> String {
    let hash = keccak256(signature.as_bytes());
    format!("0x{}", hex::encode(hash))
}
