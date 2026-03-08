use serde::{Deserialize, Serialize};

/// ABI item type
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum ItemType {
    Function,
    Event,
    Error,
    Constructor,
    Fallback,
    Receive,
}

/// Function state mutability
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum StateMutability {
    Pure,
    View,
    Payable,
    Nonpayable,
}

impl std::fmt::Display for StateMutability {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            StateMutability::Pure => write!(f, "pure"),
            StateMutability::View => write!(f, "view"),
            StateMutability::Payable => write!(f, "payable"),
            StateMutability::Nonpayable => write!(f, "nonpayable"),
        }
    }
}

/// Represents an ABI item (function, event, error, etc.)
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AbiItem {
    #[serde(default)]
    pub name: String,
    #[serde(rename = "type")]
    pub item_type: ItemType,
    #[serde(default)]
    pub inputs: Vec<AbiInput>,
    #[serde(default)]
    pub anonymous: Option<bool>,
    #[serde(rename = "stateMutability", default)]
    pub state_mutability: Option<StateMutability>,
    #[serde(default)]
    pub outputs: Option<Vec<AbiOutput>>,
}

/// Represents an input parameter in an ABI item
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AbiInput {
    pub name: String,
    #[serde(rename = "type")]
    pub input_type: String,
    #[serde(default)]
    pub indexed: Option<bool>,
    #[serde(rename = "internalType", default)]
    pub internal_type: Option<String>,
    #[serde(default)]
    pub components: Option<Vec<AbiComponent>>,
}

/// Represents an output parameter in an ABI function
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AbiOutput {
    #[serde(default)]
    pub name: String,
    #[serde(rename = "type")]
    pub output_type: String,
    #[serde(rename = "internalType", default)]
    pub internal_type: Option<String>,
    #[serde(default)]
    pub components: Option<Vec<AbiComponent>>,
}

/// Represents a component of a complex type (struct, tuple, etc.)
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AbiComponent {
    pub name: String,
    #[serde(rename = "type")]
    pub component_type: String,
    #[serde(rename = "internalType", default)]
    pub internal_type: Option<String>,
    #[serde(default)]
    pub components: Option<Vec<AbiComponent>>,
}

/// Information about a function in the ABI
#[derive(Debug, Clone, Serialize)]
pub struct FunctionInfo {
    pub name: String,
    pub signature: String,
    pub selector: String,
    pub definition: String,
    #[serde(rename = "stateMutability")]
    pub state_mutability: StateMutability,
}

/// Information about an event in the ABI
#[derive(Debug, Clone, Serialize)]
pub struct EventInfo {
    pub name: String,
    pub signature: String,
    pub topic: String,
    pub definition: String,
    pub anonymous: bool,
}

/// Information about an error in the ABI
#[derive(Debug, Clone, Serialize)]
pub struct ErrorInfo {
    pub name: String,
    pub signature: String,
    pub selector: String,
    pub definition: String,
}

/// Complete statistics and information about an ABI
#[derive(Debug, Clone, Serialize)]
pub struct AbiStats {
    pub functions: Vec<FunctionInfo>,
    pub events: Vec<EventInfo>,
    pub errors: Vec<ErrorInfo>,
    pub function_count: usize,
    pub event_count: usize,
    pub error_count: usize,
    pub view_function_count: usize,
    pub pure_function_count: usize,
    pub payable_function_count: usize,
    pub nonpayable_function_count: usize,
}
