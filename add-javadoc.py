#!/usr/bin/env python3
"""
JavaDoc Generator für RentACar Projekt
Fügt automatisch JavaDoc-Kommentare zu allen Java-Klassen hinzu
"""

import os
import re
from pathlib import Path

# JavaDoc Templates
CLASS_JAVADOC_TEMPLATE = """/**
 * {description}
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
"""

METHOD_JAVADOC_TEMPLATE = """    /**
     * {description}
     * {params}{return_doc}
     */
"""

def generate_class_description(class_name, file_path):
    """Generiert eine Beschreibung basierend auf dem Klassennamen"""
    if "Controller" in class_name:
        module = file_path.split("/")[-4] if len(file_path.split("/")) > 4 else "API"
        return f"REST Controller für {module}-Verwaltung."
    elif "Service" in class_name:
        return f"Service-Klasse für Business-Logik."
    elif "Repository" in class_name:
        return f"Repository-Interface für Datenbankzugriff."
    elif "Dto" in class_name or "DTO" in class_name:
        return f"Data Transfer Object."
    elif "Config" in class_name:
        return f"Konfigurationsklasse."
    elif "Exception" in class_name:
        return f"Custom Exception."
    elif "Event" in class_name:
        return f"Domain Event."
    elif "Listener" in class_name:
        return f"Event Listener."
    else:
        return f"Domain-Klasse für {class_name}."

def add_javadoc_to_file(file_path):
    """Fügt JavaDoc zu einer Java-Datei hinzu"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Prüfe ob bereits JavaDoc vorhanden
    if '/**' in content and '@author' in content:
        print(f"  ⏭️  Überspringe {file_path} (hat bereits JavaDoc)")
        return False
    
    # Extrahiere Klassenname
    class_match = re.search(r'public\s+(class|interface|enum)\s+(\w+)', content)
    if not class_match:
        print(f"  ⚠️  Keine Klasse gefunden in {file_path}")
        return False
    
    class_name = class_match.group(2)
    
    # Generiere Beschreibung
    description = generate_class_description(class_name, file_path)
    javadoc = CLASS_JAVADOC_TEMPLATE.format(description=description)
    
    # Füge JavaDoc vor der Klassen-Deklaration ein
    # Finde die Zeile mit der Klassen-Deklaration
    lines = content.split('\n')
    new_lines = []
    javadoc_added = False
    
    for i, line in enumerate(lines):
        # Prüfe ob dies die Zeile vor der Klassen-Deklaration ist
        if not javadoc_added and ('public class' in line or 'public interface' in line or 'public enum' in line):
            # Füge JavaDoc ein
            javadoc_lines = javadoc.rstrip().split('\n')
            new_lines.extend(javadoc_lines)
            javadoc_added = True
        
        new_lines.append(line)
    
    if javadoc_added:
        # Schreibe zurück
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print(f"  ✅ JavaDoc hinzugefügt zu {os.path.basename(file_path)}")
        return True
    
    return False

def main():
    """Hauptfunktion"""
    print("🚀 JavaDoc Generator für RentACar")
    print("=" * 50)
    
    # Finde alle Java-Dateien
    src_path = Path("src/main/java")
    if not src_path.exists():
        print("❌ src/main/java nicht gefunden!")
        return
    
    java_files = list(src_path.rglob("*.java"))
    print(f"📊 Gefunden: {len(java_files)} Java-Dateien\n")
    
    # Verarbeite jede Datei
    updated_count = 0
    for java_file in sorted(java_files):
        if add_javadoc_to_file(str(java_file)):
            updated_count += 1
    
    print("\n" + "=" * 50)
    print(f"✅ Fertig! {updated_count} Dateien aktualisiert")
    print(f"⏭️  {len(java_files) - updated_count} Dateien übersprungen")

if __name__ == "__main__":
    main()
