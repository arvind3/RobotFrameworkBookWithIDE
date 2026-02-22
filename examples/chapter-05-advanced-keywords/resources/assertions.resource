*** Keywords ***
Assert Greeting Prefix
    [Arguments]    ${message}
    Should Start With    ${message}    Good
