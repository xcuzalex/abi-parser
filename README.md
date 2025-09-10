# ABI Parser

A Rust command-line tool for analyzing Ethereum Smart Contract ABI (Application Binary Interface) files. This tool parses ABI JSON files and generates comprehensive statistics including function signatures, selectors, event topics, and detailed information about all contract interfaces.

## Features

- **Function Analysis**: Extract function signatures, selectors (first 4 bytes of keccak256 hash), and complete definitions
- **Event Analysis**: Generate event signatures, topics (full keccak256 hash), and handle anonymous events
- **Error Analysis**: Parse custom error definitions and generate error selectors
- **State Mutability Tracking**: Categorize functions by their state mutability (view, pure, payable, non-payable)
- **Complete Statistics**: Generate comprehensive statistics with counts and detailed information
- **JSON Output**: Export all analysis results to a formatted JSON file

## Installation

### Prerequisites
- Rust (2021 edition or later)
- Cargo package manager

### Build from Source

```bash
# Clone the repository
git clone <repository-url>
cd abi-parser

# Build the project
cargo build --release

# The binary will be available at target/release/abi-parser
```

## Usage

### Basic Usage

```bash
# Analyze an ABI file
./target/release/abi-parser contract.json

# This will create contract_stats.json with detailed analysis

# Try with the provided example
./target/release/abi-parser examples/example_token.json
```

### Command Line Arguments

```
abi-parser <path_to_abi_json>

Arguments:
  <path_to_abi_json>    Path to the ABI JSON file to analyze

Examples:
  abi-parser contract.json        # Analyze contract.json → contract_stats.json
  abi-parser ./abi/token.json     # Analyze token.json → ./abi/token_stats.json
  abi-parser examples/example_token.json  # Use the provided example file
```

### Example Input (ABI JSON)

```json
[
  {
    "type": "function",
    "name": "balanceOf",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "event",
    "name": "Transfer",
    "anonymous": false,
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ]
  }
]
```

### Example Output

The tool generates a detailed JSON file with the following structure:

```json
{
  "functions": [
    {
      "name": "balanceOf",
      "signature": "balanceOf(address)",
      "selector": "0x70a08231",
      "definition": "function balanceOf(address owner) view returns (uint256)",
      "stateMutability": "view"
    }
  ],
  "events": [
    {
      "name": "Transfer",
      "signature": "Transfer(address,address,uint256)",
      "topic": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "definition": "event Transfer(address from indexed, address to indexed, uint256 value)",
      "anonymous": false
    }
  ],
  "errors": [],
  "function_count": 1,
  "event_count": 1,
  "error_count": 0,
  "view_function_count": 1,
  "pure_function_count": 0,
  "payable_function_count": 0,
  "nonpayable_function_count": 0
}
```

## Output Fields Explained

### Functions
- **name**: The function name
- **signature**: The canonical function signature (e.g., `"transfer(address,uint256)"`)
- **selector**: The 4-byte function selector (first 4 bytes of keccak256 of signature)
- **definition**: Complete human-readable function definition
- **stateMutability**: The state mutability (`view`, `pure`, `payable`, `nonpayable`)

### Events
- **name**: The event name
- **signature**: The canonical event signature
- **topic**: The event topic (32-byte keccak256 hash of signature)
- **definition**: Complete human-readable event definition with indexed parameters
- **anonymous**: Whether the event is anonymous

### Errors
- **name**: The error name
- **signature**: The canonical error signature
- **selector**: The 4-byte error selector
- **definition**: Complete human-readable error definition

### Statistics
- **function_count**: Total number of functions
- **event_count**: Total number of events
- **error_count**: Total number of custom errors
- **view_function_count**: Number of view functions (read-only, accesses state)
- **pure_function_count**: Number of pure functions (no state access)
- **payable_function_count**: Number of payable functions (can receive Ether)
- **nonpayable_function_count**: Number of non-payable functions (default)

## Use Cases

### Smart Contract Development
- **Interface Analysis**: Understand the complete interface of a smart contract
- **Integration Planning**: Get function selectors for low-level calls
- **Event Monitoring**: Get event topics for filtering blockchain logs

### Security Auditing
- **Function Discovery**: Identify all available functions and their mutability
- **Event Analysis**: Understand what events a contract can emit
- **Error Handling**: Analyze custom error definitions

### Tooling and Integration
- **ABI Documentation**: Generate human-readable documentation from ABI
- **Testing**: Validate ABI completeness and structure
- **Code Generation**: Use selectors and topics for generating client code

## Technical Details

### Signature Generation
The tool follows the Ethereum ABI specification for generating signatures:
- Function signatures: `functionName(type1,type2,...)`
- Event signatures: `eventName(type1,type2,...)`
- Error signatures: `errorName(type1,type2,...)`

### Hash Calculations
- **Function Selectors**: First 4 bytes of `keccak256(signature)`
- **Event Topics**: Full 32 bytes of `keccak256(signature)`
- **Error Selectors**: First 4 bytes of `keccak256(signature)`

### Supported ABI Types
- Functions (including constructors, fallback, and receive)
- Events (including anonymous events)
- Custom Errors
- Complex types (structs, arrays, tuples)

## Project Structure

```
abi-parser/
├── src/           # Source code modules
├── examples/      # Example ABI files for testing
├── target/        # Build artifacts
└── README.md
```

The `examples/` directory contains sample ABI files that you can use to test the tool:
- `example_token.json` - A comprehensive ERC-20 token ABI with functions, events, and errors

## Dependencies

- `serde` - JSON serialization/deserialization
- `serde_json` - JSON parsing
- `tiny-keccak` - Keccak256 hashing
- `hex` - Hexadecimal encoding

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source. See the LICENSE file for details.

## Changelog

### v0.1.0
- Initial release
- Support for functions, events, and errors
- JSON output with comprehensive statistics
- Modular architecture for easy extension
