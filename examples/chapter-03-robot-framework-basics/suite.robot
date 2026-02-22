*** Settings ***
Resource    resources/user_keywords.resource

*** Test Cases ***
Validate Basic Flow
    ${user}=    Prepare User
    Verify User Is Active    ${user}
