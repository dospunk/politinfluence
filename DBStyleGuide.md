# Style Guide For Database Entires

## People
### Fields
- [name](#name)
- [party](#party)
- [link](#link)
- [state](#state)
- [district](#district)
- [position](#position)
- [donations](#donations)
- votes
- [\_id](#_id)

#### Name
- Must be a JSON Object containing the person's full legal name, no nicknames, split into first, middle, and last.
- Middle name is optional
- Must be capitalized

Example: 

    {
       first: "John",
       middle: "Hardy",
       last: "Isakson"
    }

#### Party
- The political party the person belongs to
- Must be capitalized and fully written out, no abreviations

Example: Republican

#### Link
- Should be the link to the person's official government homepage.
- If no government page is available, a personal one may be used.

Example: https://www.sanders.senate.gov/

#### State
- Must be the abreviation for the state the person currently represents
- Must be all uppercase

Example: GA

#### District
- Must be an integer representing the district the person currently represents
- If the person currently represents the entire state, that integer is 0

Example: 14

#### Position
- The office currently held by the person, prefixed by the jurisdiction of the governing body
- Mut be capitalized and not abreviated

Example: United States House Of Representitives
Example: State Governer

#### Donations
- Must be a JSON Object containing at least `total: 0`
- Every other key should be the name of an issue and should represent another JSON object containing at least `{ pro: 0, anti: 0 }`

Example: 

    {
       total: 5000,
       'Big Business': {
         pro: 500,
         anti: 1060
       },
       'Public Education': {
         pro: 1800,
         anti: 40
       }
    }

#### Votes
- Must be a JSON object containing the ObjectId of the bill in question with the key 'bill' and the vote 'y' or 'n' with they key 'yn'

Example:

    {
       bill: ObjectId("123a456bcdefg7890h12345i"),
       yn: 'y'
    }

#### \_id
- Must be an ObjectID Object
- Assigned by MongoDB

Example: ObjectId("591a259ddbcdf7492c67139a")

## Entities
### Fields
- name
- link
- issues
- \_id

## Donations
### Fields
- amount
- date
- pac
- to
- from
- \_id

## Bills
### Fields
- name
- date
- desc
- issues
- \_id
