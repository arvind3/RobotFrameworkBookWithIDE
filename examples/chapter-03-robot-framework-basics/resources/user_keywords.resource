*** Keywords ***
Prepare User
    [Return]    learner_user

Verify User Is Active
    [Arguments]    ${user}
    Should Be Equal    ${user}    learner_user
