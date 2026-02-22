*** Settings ***
Resource    resources/best_practices.resource

*** Test Cases ***
Best Practice Scenario
    ${user}=    Resolve Stable User
    ${order}=    Resolve Stable Order
    Should Not Be Empty    ${user}
    Should Not Be Empty    ${order}
