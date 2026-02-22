*** Settings ***
Resource    resources/common.resource

*** Test Cases ***
Welcome Message Is Available
    ${message}=    Get Welcome Message
    Should Be Equal    ${message}    Hello from chapter 01
