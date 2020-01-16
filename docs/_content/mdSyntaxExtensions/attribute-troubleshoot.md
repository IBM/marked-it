---
title: Styling troubleshooting topics
weight: 7
---

The following are attributes used when creating troubleshooting topics.

| Attribute | Description | Position |
|-----------|-------------|----------|
| `{:tsSymptoms: .tsSymptoms}` |  The `{: tsSymptoms}` element outputs `class="tsSymptoms"`, and when rendered in the IBM Cloud doc app, the CSS renders this as a new section called `What's happening`. | On a new line following paragraph describing the symptoms of the problem. |
| `{:tsCauses: .tsCauses}` | The `{: tsCauses}` element outputs `class="tsCauses"`, and when rendered in the IBM Cloud doc app, the CSS renders this as a new section called `Why it's happening`. | On a new line following paragraph describing the cause. |
| `{:tsResolve: .tsResolve}` |  The `{: tsResolve}` element outputs `class="tsResolve"`, and when rendered in the IBM Cloud doc app, the CSS renders this as a new section called `How to fix it`. | On a new line following paragraph or list describing the suggested solution. |


#### Example input

```markdown
When you try to apply a subscription or feature code, you see an error that states that the code cannot be applied.
{: tsSymptoms}

Your account doesn't meet the requirements for the feature code, or you don't have the required access in the account.
{: tsCauses}

* Verify you have the correct account type. For example, some feature codes for educational promotions are only for Lite accounts. To view your account type, go to **Manage > Account**, and select **Account settings**. For details, see [Applying feature codes](/docs/account?topic=account-codes).
* Verify that you have access to apply the code. To apply any code, you must have an Editor role or higher on all account management services. To view or change roles, see [Assigning access to account management services](/docs/iam?topic=iam-account-services).
{: tsResolve}
```

#### Example output

```html
<p class="tsSymptoms">When you try to apply a subscription or feature code, you see an error that states that the code cannot be applied.</p>
<p class="tsCauses">Your account doesn&#39;t meet the requirements for the feature code, or you don&#39;t have the required access in the account.</p>
<ul class="tsResolve">
<li>Verify you have the correct account type. For example, some feature codes for educational promotions are only for Lite accounts. To view your account type, go to <strong>Manage &gt; Account</strong>, and select <strong>Account settings</strong>.
For details, see <a href="/docs/account?topic=account-codes">Applying feature codes</a>.</li>
<li>Verify that you have access to apply the code. To apply any code, you must have an Editor role or higher on all account management services. To view or change roles, see <a href="/docs/iam?topic=iam-account-services">Assigning access to account management services</a>.</li>
</ul>
```