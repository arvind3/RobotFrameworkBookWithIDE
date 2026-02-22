*** Keywords ***
Login As User
    [Arguments]    ${user}
    Should Not Be Empty    ${user}
    Log    Logged in ${user}
