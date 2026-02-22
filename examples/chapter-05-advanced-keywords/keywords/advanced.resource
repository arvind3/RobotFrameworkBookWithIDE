*** Keywords ***
Build Greeting
    [Arguments]    ${name}    ${time_of_day}
    ${greeting}=    Set Variable    Good ${time_of_day}, ${name}
    [Return]    ${greeting}
