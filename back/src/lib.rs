use borsh::{BorshDeserialize, BorshSerialize};
use std::convert::TryFrom;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
};

#[derive(BorshDeserialize,BorshSerialize,Debug)]
struct Message {
    pub text: String,
}



#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct DataLength {
  pub length: u32,
}



entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    if instruction_data.len() == 0{
        return Err(ProgramError::InvalidInstructionData);
        
    }
    if instruction_data[0] == 0{
        return create_account(
            program_id,
            accounts,
            &instruction_data[1..instruction_data.len()],
        );
    }
    else if instruction_data[0] == 1{
        return send_message(
            program_id,
            accounts,
            &instruction_data[1..instruction_data.len()],
        )
    }
    else {
        return Err(ProgramError::InvalidInstructionData);
    }

}

fn create_account(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult{
    let accounts_iter = &mut accounts.iter();
    let pda_account = next_account_info(accounts_iter)?;
    let payer_account = next_account_info(accounts_iter)?;
    if pda_account.owner != program_id{
    
        return Err(ProgramError::IncorrectProgramId);
    }
    if !payer_account.is_signer{
    
        return Err(ProgramError::MissingRequiredSignature);
    }
    if !pda_account.is_writable{
    
        return Err(ProgramError::IncorrectProgramId);
    }
    let welcome_message = Message{
        text: String::from("welcome to your account"),
    };
    welcome_message.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    Ok(())
}

fn send_message(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult{
    let accounts_iter = &mut accounts.iter();
    let pda_account = next_account_info(accounts_iter)?;
    let payer_account = next_account_info(accounts_iter)?;
    if pda_account.owner != program_id{
    
        return Err(ProgramError::IncorrectProgramId);
    }
    if !payer_account.is_signer{
    
        return Err(ProgramError::MissingRequiredSignature);
    }
    if !pda_account.is_writable{
    
        return Err(ProgramError::IncorrectProgramId);
    }
    let offset: usize = 4;
    let data_length = DataLength::try_from_slice(&pda_account.data.borrow()[..offset])?;
    let flag = usize::try_from(data_length.length + u32::try_from(offset).unwrap()).unwrap();

    let mut input_data = Message::try_from_slice(&instruction_data)?;
    
    let mut stored_data = Message::try_from_slice(&pda_account.data.borrow()[0..flag])?;
    stored_data.text.push_str(&input_data.text);
    stored_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    
    

    Ok(())
}


