mod crypto;
mod file_utils;
mod parser;
mod signatures;
mod types;

use crate::file_utils::{generate_output_path, read_abi_file, write_output_file};
use crate::parser::parse_abi_items;
use crate::types::AbiItem;
use std::env;

/// Print usage information
fn print_usage(program_name: &str) {
    eprintln!("ABI Parser - Analyze Ethereum Smart Contract ABI files");
    eprintln!();
    eprintln!("Usage: {} <path_to_abi_json>", program_name);
    eprintln!();
    eprintln!("Arguments:");
    eprintln!("  <path_to_abi_json>    Path to the ABI JSON file to analyze");
    eprintln!();
    eprintln!("Examples:");
    eprintln!("  {} contract.json      # Analyze contract.json and output to contract_stats.json", program_name);
    eprintln!("  {} ./abi/token.json   # Analyze token.json and output to ./abi/token_stats.json", program_name);
}

/// Main application entry point
fn main() {
    let args: Vec<String> = env::args().collect();

    // Check if correct number of arguments provided
    if args.len() != 2 {
        print_usage(&args[0]);
        std::process::exit(1);
    }

    let file_path = &args[1];

    // Read and parse ABI file
    let abi_content = match read_abi_file(file_path) {
        Ok(content) => content,
        Err(e) => {
            eprintln!("Error reading ABI file: {}", e);
            std::process::exit(1);
        }
    };

    // Parse JSON content
    let abi: Vec<AbiItem> = match serde_json::from_str(&abi_content) {
        Ok(parsed) => parsed,
        Err(e) => {
            eprintln!("Error parsing ABI JSON: {}", e);
            std::process::exit(1);
        }
    };

    // Parse ABI items and generate statistics
    let stats = parse_abi_items(abi);

    // Serialize statistics to JSON
    let output = match serde_json::to_string_pretty(&stats) {
        Ok(json) => json,
        Err(e) => {
            eprintln!("Error serializing statistics: {}", e);
            std::process::exit(1);
        }
    };

    // Generate output file path
    let output_path = generate_output_path(file_path, None);

    // Write output to file
    match write_output_file(&output_path, &output) {
        Ok(_) => println!("ABI statistics written to: {}", output_path),
        Err(e) => {
            eprintln!("Error writing output file: {}", e);
            std::process::exit(1);
        }
    }

    // Print summary to console
    print_summary(&stats);
}

/// Print a summary of the ABI statistics to the console
/// 
/// # Arguments
/// * `stats` - The ABI statistics to summarize
fn print_summary(stats: &crate::types::AbiStats) {
    println!();
    println!("=== ABI Analysis Summary ===");
    println!("Functions: {} total", stats.function_count);
    if stats.function_count > 0 {
        println!("  - View: {}", stats.view_function_count);
        println!("  - Pure: {}", stats.pure_function_count);
        println!("  - Payable: {}", stats.payable_function_count);
        println!("  - Non-payable: {}", stats.nonpayable_function_count);
    }
    println!("Events: {}", stats.event_count);
    println!("Errors: {}", stats.error_count);
    println!();
}
