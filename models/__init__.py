def create_project_structure():
    init_files = [
        'mediguard/__init__.py',
        'mediguard/models/__init__.py',
        'mediguard/database/__init__.py'
    ]

    for init_file in init_files:
        with open(init_file, 'w') as f:
            f.write('# MediGuard Package\n')
        print(f"Created file: {init_file}")

if __name__ == "__main__":
    create_project_structure()
