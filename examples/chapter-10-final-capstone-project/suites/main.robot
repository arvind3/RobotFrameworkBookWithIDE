*** Settings ***
Resource    ../resources/common.resource
Resource    ../resources/auth.resource
Resource    ../resources/orders.resource
Resource    ../resources/reports.resource
Resource    ../keywords/logging.robot
Library    ../libraries/data_factory.py
Library    ../libraries/assertions.py
Variables    ../variables/env.py

*** Test Cases ***
Capstone End To End
    ${user}=    Build User Name    demo
    Open Capstone Session    ${ENVIRONMENT}
    Log Step    Login sequence
    Login As User    ${user}
    Create Order For User    ${user}    2
    Cancel Order For User    ${user}
    Generate Daily Report
    Assert Text Contains    ${user}    demo
