*** Keywords ***
Call Mock API
    [Arguments]    ${endpoint}
    Should Not Be Empty    ${endpoint}
    Log    Calling API endpoint ${endpoint}
