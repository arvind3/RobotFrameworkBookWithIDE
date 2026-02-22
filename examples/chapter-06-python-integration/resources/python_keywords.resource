*** Keywords ***
Validate Label
    [Arguments]    ${label}
    Should Start With    ${label}    label::
