*** Settings ***
Resource    ../resources/auth.resource
Resource    ../resources/order.resource
Library    ../libraries/session.py

*** Test Cases ***
Run Multi File Scenario
    ${session}=    Open Session
    Authenticate User    ${session}
    Create Order    ${session}
