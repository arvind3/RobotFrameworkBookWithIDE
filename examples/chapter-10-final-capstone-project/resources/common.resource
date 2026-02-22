*** Keywords ***
Open Capstone Session
    [Arguments]    ${environment}
    Should Not Be Empty    ${environment}
    Log    Opened session in ${environment}
