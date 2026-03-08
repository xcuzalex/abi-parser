use crate::types::{AbiComponent, AbiInput, AbiOutput, StateMutability};

/// Resolve a type string, expanding tuple types using their components
///
/// For tuple types (e.g. "tuple", "tuple[]", "tuple[3]"), the components
/// are expanded recursively to produce the canonical ABI signature.
fn resolve_type(type_str: &str, components: &Option<Vec<AbiComponent>>) -> String {
    if !type_str.starts_with("tuple") {
        return type_str.to_string();
    }

    // Extract the suffix after "tuple" (e.g. "[]", "[3]", or "")
    let suffix = &type_str["tuple".len()..];

    if let Some(components) = components {
        let inner: Vec<String> = components
            .iter()
            .map(|c| resolve_type(&c.component_type, &c.components))
            .collect();
        format!("({}){}", inner.join(","), suffix)
    } else {
        // No components available, keep as-is (shouldn't happen in valid ABI)
        type_str.to_string()
    }
}

/// Generate a function signature string from name and inputs
///
/// # Arguments
/// * `name` - The function name
/// * `inputs` - The function input parameters
///
/// # Returns
/// * `String` - The function signature in the format "functionName(type1,type2,...)"
pub fn get_function_signature(name: &str, inputs: &[AbiInput]) -> String {
    let mut signature = name.to_string();
    signature.push('(');

    let input_types: Vec<String> = inputs
        .iter()
        .map(|input| resolve_type(&input.input_type, &input.components))
        .collect();

    signature.push_str(&input_types.join(","));
    signature.push(')');

    signature
}

/// Create a complete function definition string for display
/// 
/// # Arguments
/// * `name` - The function name
/// * `inputs` - The function input parameters
/// * `outputs` - The function output parameters (optional)
/// * `state_mutability` - The state mutability of the function
/// 
/// # Returns
/// * `String` - The complete function definition
pub fn create_function_definition(
    name: &str,
    inputs: &[AbiInput],
    outputs: &Option<Vec<AbiOutput>>,
    state_mutability: &StateMutability,
) -> String {
    let mut def = format!("function {}(", name);

    // Process input parameters
    let input_params: Vec<String> = inputs
        .iter()
        .map(|input| {
            let mut param = format!("{} {}", input.input_type, input.name);
            // Add internal type as comment if different from input type
            if let Some(internal_type) = &input.internal_type {
                if internal_type != &input.input_type {
                    param = format!("{} /* {} */", param, internal_type);
                }
            }
            param
        })
        .collect();

    def.push_str(&input_params.join(", "));
    def.push_str(")");

    // Add state mutability (skip "nonpayable" as it's the default)
    if *state_mutability != StateMutability::Nonpayable {
        def.push_str(&format!(" {}", state_mutability));
    }

    // Process output parameters
    if let Some(outputs) = outputs {
        if !outputs.is_empty() {
            def.push_str(" returns (");

            let output_params: Vec<String> = outputs
                .iter()
                .map(|output| {
                    if output.name.is_empty() {
                        output.output_type.clone()
                    } else {
                        format!("{} {}", output.output_type, output.name)
                    }
                })
                .collect();

            def.push_str(&output_params.join(", "));
            def.push_str(")");
        }
    }

    def
}

/// Create a complete event definition string for display
/// 
/// # Arguments
/// * `name` - The event name
/// * `inputs` - The event input parameters
/// * `anonymous` - Whether the event is anonymous
/// 
/// # Returns
/// * `String` - The complete event definition
pub fn create_event_definition(name: &str, inputs: &[AbiInput], anonymous: bool) -> String {
    let mut def = format!("event {}(", name);

    // Process input parameters
    let input_params: Vec<String> = inputs
        .iter()
        .map(|input| {
            let indexed = input.indexed.unwrap_or(false);
            if indexed {
                format!("{} indexed {}", input.input_type, input.name)
            } else {
                format!("{} {}", input.input_type, input.name)
            }
        })
        .collect();

    def.push_str(&input_params.join(", "));
    def.push_str(")");

    // Add "anonymous" keyword if the event is anonymous
    if anonymous {
        def.push_str(" anonymous");
    }

    def
}

/// Create a complete error definition string for display
/// 
/// # Arguments
/// * `name` - The error name
/// * `inputs` - The error input parameters
/// 
/// # Returns
/// * `String` - The complete error definition
pub fn create_error_definition(name: &str, inputs: &[AbiInput]) -> String {
    let mut def = format!("error {}(", name);

    // Process input parameters
    let input_params: Vec<String> = inputs
        .iter()
        .map(|input| {
            format!("{} {}", input.input_type, input.name)
        })
        .collect();

    def.push_str(&input_params.join(", "));
    def.push_str(")");

    def
}
