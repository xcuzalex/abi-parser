# Examples

This directory contains example ABI files that demonstrate the capabilities of the ABI Parser tool.

## Files

### `example_token.json`
A comprehensive ERC-20 token ABI that includes:
- **Functions**: Various types including view, pure, payable, and non-payable functions
  - `balanceOf` (view) - Check token balance
  - `transfer` (non-payable) - Transfer tokens
  - `approve` (non-payable) - Approve spending
  - `mint` (payable) - Mint new tokens
  - `calculateHash` (pure) - Pure computation function
- **Events**: Standard and anonymous events
  - `Transfer` - Token transfer event
  - `Approval` - Token approval event
  - `Debug` - Anonymous debug event
- **Errors**: Custom error definitions
  - `InsufficientBalance` - Error with parameters
  - `InvalidAddress` - Simple error without parameters

## Usage

```bash
# Analyze the example token ABI
./target/release/abi-parser examples/example_token.json

# This will generate examples/example_token_stats.json
```

## Expected Output

The analysis will show:
- 5 functions (1 view, 1 pure, 1 payable, 2 non-payable)
- 3 events (2 standard, 1 anonymous)
- 2 custom errors

Each item includes complete signatures, selectors/topics, and human-readable definitions.
