*** Keywords ***
Authenticate User
    [Arguments]    ${session}
    Should Contain    ${session}    session-
