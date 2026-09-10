# VAT, EWT, and ATC Formula Reference

This document defines the correct VAT and EWT computation rules used by voucher modules such as cash voucher, disbursement voucher, petty cash voucher, petty cash replenishment, revolving fund, revolving fund replenishment, and accounts payable voucher.

## Key Terms

### Gross Amount

The total invoice or voucher amount entered by the user.

When VAT is inclusive, the gross amount already contains VAT.

### VATable Amount

The amount subject to VAT before VAT is added.

For VAT-inclusive 12% transactions:

```text
VATable Amount = Gross Amount / 1.12
```

For VAT-exclusive transactions:

```text
VATable Amount = Gross Amount
```

unless the system separately stores gross as net plus VAT.

### VAT

Value Added Tax.

For VAT-inclusive 12% transactions:

```text
VAT = Gross Amount / 1.12 * 0.12
```

This is equivalent to:

```text
VAT = Gross Amount - VATable Amount
```

For non-12% or VAT-exclusive calculations:

```text
VAT = Gross Amount * VAT Percentage
```

### ATC

ATC means Alphanumeric Tax Code. It identifies the withholding tax rule to use.

The ATC code determines the EWT percentage. For example, an ATC may represent a 2% EWT rate.

### EWT

EWT means Expanded Withholding Tax.

EWT is computed from the VATable amount when VAT is 12%.

```text
EWT = (Gross Amount / 1.12) * EWT Percentage
```

If VAT percentage is not 12%, EWT is computed from the gross amount.

```text
EWT = Gross Amount * EWT Percentage
```

## Correct Formula Rules

### VAT Amount

When VAT percentage is 12:

```text
VAT Amount = Gross Amount / 1.12 * 0.12
```

When VAT percentage is not 12:

```text
VAT Amount = Gross Amount * VAT Percentage
```

### EWT Amount

When VAT percentage is 12:

```text
EWT Amount = (Gross Amount / 1.12) * EWT Percentage
```

When VAT percentage is not 12:

```text
EWT Amount = Gross Amount * EWT Percentage
```

### Net Payable

EWT is withheld from the gross amount.

```text
Net Payable = Gross Amount - EWT Amount
```

VAT is not deducted from the payable amount for VAT-inclusive vouchers. VAT is separated for accounting and reporting, while EWT reduces the payable amount.

## VAT-Inclusive Example

Given:

```text
Gross Amount = 300.00
VAT Percentage = 12%
ATC / EWT Percentage = 2%
```

Compute VATable amount:

```text
VATable Amount = 300 / 1.12
VATable Amount = 267.857143
```

Compute VAT:

```text
VAT = 300 - 267.857143
VAT = 32.142857
```

Equivalent VAT formula:

```text
VAT = 300 / 1.12 * 0.12
VAT = 32.142857
```

Compute EWT using the VATable amount:

```text
EWT = 267.857143 * 0.02
EWT = 5.357143
EWT = 5.36
```

Compute net payable:

```text
Net Payable = 300 - 5.36
Net Payable = PHP 294.64
```

## Expected Rounded Results

For gross amount `300.00`, VAT `12%`, and EWT `2%`:

| Field | Amount |
| --- | ---: |
| Gross Amount | 300.00 |
| VATable Amount | 267.86 |
| VAT Amount | 32.14 |
| EWT Amount | 5.36 |
| Net Payable | 294.64 |

## Implementation Notes

- Treat `12%` VAT as VAT-inclusive when deriving VAT and EWT.
- Use `Gross Amount / 1.12` as the tax base for both VAT and EWT when VAT is 12%.
- Use gross amount as the EWT base when VAT is not 12%.
- Round displayed currency amounts to 2 decimal places.
- Keep the unrounded intermediate base during calculation where possible, then round the final displayed or stored currency amount.
