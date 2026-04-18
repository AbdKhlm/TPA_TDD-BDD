# features/products.feature
Feature: Product Management
  As a user
  I want to manage products
  So that I can keep track of available items

  Background:
    Given the following products exist in the system
      | name        | category    | price | stock | availability |
      | Laptop      | Electronics | 15000 | 10    | true         |
      | Phone       | Electronics | 8000  | 25    | true         |
      | Novel       | Books       | 200   | 50    | false        |

  # ==================== Tugas 6.1: READ ====================
  @read
  Scenario: Successfully read an existing product by ID
    When I send a GET request to "/products/{id}" with id of "Laptop"
    Then the response status code should be 200
    And the response body should contain product details with name "Laptop", category "Electronics", price 15000, stock 10, and availability true

  @read_not_found
  Scenario: Attempt to read a product that does not exist
    When I send a GET request to "/products/invalid-id-123"
    Then the response status code should be 404
    And the response body should have an error message "Product not found"

  # ==================== Tugas 6.2: UPDATE ====================
  @update
  Scenario: Successfully update an existing product
    Given the following products exist in the system
      | name        | category    | price | stock | availability |
      | Old Laptop  | Electronics | 10000 | 5     | true         |
    When I send a PUT request to "/products/{id}" with id of "Old Laptop" and the following update data
      | name        | price | stock | availability |
      | New Laptop  | 12000 | 8     | false        |
    Then the response status code should be 200
    And the response body should contain product details with name "New Laptop", price 12000, stock 8, and availability false
    And the category should still be "Electronics"

  @update_not_found
  Scenario: Attempt to update a product that does not exist
    When I send a PUT request to "/products/invalid-id-999" with update data
      | name | New Name |
    Then the response status code should be 404
    And the response body should have an error message "Product not found"

  @update_invalid_data
  Scenario: Attempt to update a product with invalid data (negative price)
    Given the following products exist in the system
      | name    | category    | price | stock | availability |
      | Laptop  | Electronics | 10000 | 5     | true         |
    When I send a PUT request to "/products/{id}" with id of "Laptop" and the following update data
      | price |
      | -500  |
    Then the response status code should be 400
    And the response body should have an error message "Price cannot be negative"

  # ==================== Tugas 6.3: DELETE ====================
  @delete
  Scenario: Successfully delete an existing product
    Given the following products exist in the system
      | name       | category    | price | stock | availability |
      | Laptop     | Electronics | 15000 | 10    | true         |
      | Mouse      | Accessories | 500   | 30    | true         |
    When I send a DELETE request to "/products/{id}" with id of "Laptop"
    Then the response status code should be 204
    And when I send a GET request to "/products/{id}" with id of "Laptop"
    Then the response status code should be 404

  @delete_not_found
  Scenario: Attempt to delete a product that does not exist
    When I send a DELETE request to "/products/non-existent-id"
    Then the response status code should be 404
    And the response body should have an error message "Product not found"

  @delete_invalid_id
  Scenario: Attempt to delete a product with invalid ID format
    When I send a DELETE request to "/products/invalid-id-format"
    Then the response status code should be 400
    And the response body should have an error message "Invalid product ID"

  # ==================== Tugas 6.4: LIST ALL ====================
  @list_all
  Scenario: Successfully retrieve all products
    Given the following products exist in the system
      | name        | category    | price | stock | availability |
      | Laptop      | Electronics | 15000 | 10    | true         |
      | Phone       | Electronics | 8000  | 25    | true         |
      | Novel       | Books       | 200   | 50    | false        |
    When I send a GET request to "/products"
    Then the response status code should be 200
    And the response body should be a list containing at least 3 products
    And the list should include a product with name "Laptop", category "Electronics", price 15000, stock 10, availability true
    And the list should include a product with name "Phone", category "Electronics", price 8000, stock 25, availability true
    And the list should include a product with name "Novel", category "Books", price 200, stock 50, availability false

  @list_all_empty
  Scenario: Retrieve all products when no products exist
    Given the system has no products
    When I send a GET request to "/products"
    Then the response status code should be 200
    And the response body should be an empty list

  # ==================== Tugas 6.5: LIST BY CATEGORY ====================
  @list_by_category
  Scenario: Successfully find products by category (exact match)
    Given the following products exist in the system
      | name        | category    | price | stock | availability |
      | Laptop      | Electronics | 15000 | 10    | true         |
      | Phone       | Electronics | 8000  | 25    | true         |
      | Novel       | Books       | 200   | 50    | false        |
    When I send a GET request to "/products?category=Electronics"
    Then the response status code should be 200
    And the response body should be a list containing exactly 2 products
    And every product in the list should have category "Electronics"
    And the list should include a product with name "Laptop"
    And the list should include a product with name "Phone"

  @list_by_category_partial
  Scenario: Successfully find products by partial category match (case-insensitive)
    Given the following products exist in the system
      | name        | category              | price | stock | availability |
      | Smart TV    | Electronics & Gadgets | 20000 | 5     | true         |
      | Radio       | Electronics           | 1000  | 20    | true         |
      | Book        | Books                 | 100   | 100   | true         |
    When I send a GET request to "/products?category=lectron"
    Then the response status code should be 200
    And the response body should be a list containing exactly 2 products
    And every product in the list should have category that contains "lectron" (case-insensitive)

  @list_by_category_not_found
  Scenario: Search for products with a category that does not exist
    Given the following products exist in the system
      | name   | category    |
      | Laptop | Electronics |
    When I send a GET request to "/products?category=NonExistentCategory"
    Then the response status code should be 200
    And the response body should be an empty list

  @list_by_category_empty
  Scenario: Search for products with empty category parameter
    Given the following products exist in the system
      | name   | category    |
      | Laptop | Electronics |
    When I send a GET request to "/products?category="
    Then the response status code should be 200
    And the response body should be a list containing all products

  # ==================== Tugas 6.6: LIST BY AVAILABILITY ====================
  @list_by_availability
  Scenario: Successfully find products with availability true
    Given the following products exist in the system
      | name        | category    | price | stock | availability |
      | Laptop      | Electronics | 15000 | 10    | true         |
      | Phone       | Electronics | 8000  | 25    | true         |
      | Novel       | Books       | 200   | 50    | false        |
    When I send a GET request to "/products?availability=true"
    Then the response status code should be 200
    And the response body should be a list containing exactly 2 products
    And every product in the list should have availability true
    And the list should include a product with name "Laptop"
    And the list should include a product with name "Phone"

  @list_by_availability_false
  Scenario: Successfully find products with availability false
    Given the following products exist in the system
      | name        | category    | price | stock | availability |
      | Laptop      | Electronics | 15000 | 10    | true         |
      | Novel       | Books       | 200   | 50    | false        |
      | Magazine    | Books       | 50    | 0     | false        |
    When I send a GET request to "/products?availability=false"
    Then the response status code should be 200
    And the response body should be a list containing exactly 2 products
    And every product in the list should have availability false

  @list_by_availability_invalid
  Scenario: Attempt to filter products with invalid availability value
    Given the following products exist in the system
      | name   | category    | price | stock | availability |
      | Laptop | Electronics | 15000 | 10    | true         |
    When I send a GET request to "/products?availability=invalid"
    Then the response status code should be 400
    And the response body should have an error message "Invalid availability value"

  @list_by_availability_no_products
  Scenario: Filter products by availability when none match
    Given the following products exist in the system
      | name   | category    | price | stock | availability |
      | Laptop | Electronics | 15000 | 10    | true         |
    When I send a GET request to "/products?availability=false"
    Then the response status code should be 200
    And the response body should be an empty list

  # ==================== Tugas 6.7: LIST BY NAME ====================
  @list_by_name
  Scenario: Successfully find products by exact name match
    Given the following products exist in the system
      | name        | category    | price | stock | availability |
      | Laptop Pro  | Electronics | 20000 | 5     | true         |
      | Laptop Air  | Electronics | 15000 | 10    | true         |
      | Phone       | Electronics | 8000  | 25    | true         |
    When I send a GET request to "/products?name=Laptop Pro"
    Then the response status code should be 200
    And the response body should be a list containing exactly 1 product
    And the product should have name "Laptop Pro", category "Electronics", price 20000

  @list_by_name_partial
  Scenario: Successfully find products by partial name match (case-insensitive)
    Given the following products exist in the system
      | name        | category    | price | stock | availability |
      | Apple MacBook | Electronics | 25000 | 8     | true         |
      | Apple iPhone  | Electronics | 12000 | 20    | true         |
      | Samsung Galaxy | Electronics | 10000 | 15    | true         |
    When I send a GET request to "/products?name=apple"
    Then the response status code should be 200
    And the response body should be a list containing exactly 2 products
    And every product in the list should have name that contains "apple" (case-insensitive)

  @list_by_name_not_found
  Scenario: Search for products with a name that does not exist
    Given the following products exist in the system
      | name   | category    | price | stock |
      | Laptop | Electronics | 15000 | 10    |
    When I send a GET request to "/products?name=NonExistentName"
    Then the response status code should be 200
    And the response body should be an empty list

  @list_by_name_empty
  Scenario: Search for products with empty name parameter
    Given the following products exist in the system
      | name   | category    |
      | Laptop | Electronics |
    When I send a GET request to "/products?name="
    Then the response status code should be 200
    And the response body should be a list containing all products