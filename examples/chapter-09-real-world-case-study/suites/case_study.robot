*** Settings ***
Resource    ../resources/auth.resource
Resource    ../resources/orders.resource
Library    ../libraries/case_helpers.py

*** Test Cases ***
Run Case Study
    ${user}=    Build Case User    rws
    Authenticate Case User    ${user}
    ${result}=    Submit Case Order    ${user}
    Should Contain    ${result}    created
