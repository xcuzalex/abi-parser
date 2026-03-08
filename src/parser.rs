use crate::crypto::{get_function_selector, get_event_topic};
use crate::signatures::{
    create_error_definition, create_event_definition, create_function_definition,
    get_function_signature,
};
use crate::types::{AbiItem, AbiStats, ErrorInfo, EventInfo, FunctionInfo, ItemType, StateMutability};

/// Parse ABI items and generate comprehensive statistics
/// 
/// # Arguments
/// * `abi` - Vector of ABI items to parse
/// 
/// # Returns
/// * `AbiStats` - Complete statistics and information about the ABI
pub fn parse_abi_items(abi: Vec<AbiItem>) -> AbiStats {
    let mut functions = Vec::new();
    let mut events = Vec::new();
    let mut errors = Vec::new();
    
    // Counters for different function types
    let mut view_count = 0;
    let mut pure_count = 0;
    let mut payable_count = 0;
    let mut nonpayable_count = 0;

    for item in abi {
        match item.item_type {
            ItemType::Function => {
                let function_info = process_function_item(&item, &mut view_count, &mut pure_count, &mut payable_count, &mut nonpayable_count);
                functions.push(function_info);
            }
            ItemType::Event => {
                let event_info = process_event_item(&item);
                events.push(event_info);
            }
            ItemType::Error => {
                let error_info = process_error_item(&item);
                errors.push(error_info);
            }
            _ => {
                // Skip other item types (constructor, fallback, receive)
            }
        }
    }

    let function_count = functions.len();
    let event_count = events.len();
    let error_count = errors.len();

    AbiStats {
        functions,
        events,
        errors,
        function_count,
        event_count,
        error_count,
        view_function_count: view_count,
        pure_function_count: pure_count,
        payable_function_count: payable_count,
        nonpayable_function_count: nonpayable_count,
    }
}

/// Process a function ABI item and return function information
/// 
/// # Arguments
/// * `item` - The function ABI item
/// * `view_count` - Mutable reference to view function counter
/// * `pure_count` - Mutable reference to pure function counter
/// * `payable_count` - Mutable reference to payable function counter
/// * `nonpayable_count` - Mutable reference to nonpayable function counter
/// 
/// # Returns
/// * `FunctionInfo` - Information about the function
fn process_function_item(
    item: &AbiItem,
    view_count: &mut usize,
    pure_count: &mut usize,
    payable_count: &mut usize,
    nonpayable_count: &mut usize,
) -> FunctionInfo {
    let signature = get_function_signature(&item.name, &item.inputs);
    let selector = get_function_selector(&signature);

    let state_mutability = item
        .state_mutability
        .clone()
        .unwrap_or(StateMutability::Nonpayable);

    // Count function types by state mutability
    match state_mutability {
        StateMutability::View => *view_count += 1,
        StateMutability::Pure => *pure_count += 1,
        StateMutability::Payable => *payable_count += 1,
        StateMutability::Nonpayable => *nonpayable_count += 1,
    }

    // Create complete function definition for display
    let definition = create_function_definition(
        &item.name,
        &item.inputs,
        &item.outputs,
        &state_mutability,
    );

    FunctionInfo {
        name: item.name.clone(),
        signature,
        selector,
        definition,
        state_mutability,
    }
}

/// Process an event ABI item and return event information
/// 
/// # Arguments
/// * `item` - The event ABI item
/// 
/// # Returns
/// * `EventInfo` - Information about the event
fn process_event_item(item: &AbiItem) -> EventInfo {
    let signature = get_function_signature(&item.name, &item.inputs);
    let topic = get_event_topic(&signature);
    let anonymous = item.anonymous.unwrap_or(false);

    // Create complete event definition for display
    let definition = create_event_definition(&item.name, &item.inputs, anonymous);

    EventInfo {
        name: item.name.clone(),
        signature,
        topic,
        definition,
        anonymous,
    }
}

/// Process an error ABI item and return error information
/// 
/// # Arguments
/// * `item` - The error ABI item
/// 
/// # Returns
/// * `ErrorInfo` - Information about the error
fn process_error_item(item: &AbiItem) -> ErrorInfo {
    let signature = get_function_signature(&item.name, &item.inputs);
    let selector = get_function_selector(&signature);

    // Create complete error definition for display
    let definition = create_error_definition(&item.name, &item.inputs);

    ErrorInfo {
        name: item.name.clone(),
        signature,
        selector,
        definition,
    }
}
