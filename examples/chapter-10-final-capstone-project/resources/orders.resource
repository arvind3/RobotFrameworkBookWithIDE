*** Keywords ***
Create Order For User
    [Arguments]    ${user}    ${quantity}
    Should Be Equal As Integers    ${quantity}    2
    Log    Created order for ${user}

Cancel Order For User
    [Arguments]    ${user}
    Log    Canceled order for ${user}
