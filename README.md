# Yushan
Designing Modern Software Systems.

sequenceDiagram
    participant MC as ManageInventoryControl
    participant PI as XMLPersistenceImpl
    participant FS as FileStore
    participant C as Category
    participant P as Product
    participant V as Vendor

    MC->>MC: load()
    activate MC

    %% Load Categories
    MC->>PI: data = readData("Category")
    activate PI
    PI->>FS: openFile("Category.xml")
    PI->>FS: rawXML = readFile()
    PI->>FS: closeFile()
    PI-->>PI: Create Category objects from rawXML
    create C
    PI->>C: new(id, name, desc)
    deactivate C
    PI-->>MC: categoryList
    deactivate PI

    %% Load Products
    MC->>PI: data = readData("Product")
    activate PI
    PI->>FS: openFile("Products.xml")
    PI->>FS: rawXML = readFile()
    PI->>FS: closeFile()
    PI-->>PI: Create Product objects from rawXML
    create P
    PI->>P: new(...)
    deactivate P
    PI-->>MC: productList
    deactivate PI

    %% Load Vendors
    MC->>PI: data = readData("Vendor")
    activate PI
    PI->>FS: openFile("Vendors.xml")
    PI->>FS: rawXML = readFile()
    PI->>FS: closeFile()
    PI-->>PI: Create Vendor objects from rawXML
    create V
    PI->>V: new(name, desc)
    deactivate V
    PI-->>MC: vendorList
    deactivate PI

    deactivate MC
