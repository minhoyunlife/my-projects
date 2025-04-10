import { useEffect, useState } from "react";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { X, GripVertical } from "lucide-react";

import { ComboBox } from "@/src/components/(authenticated)/combo-box";
import { Button } from "@/src/components/base/button";

export interface SelectedArtwork {
  id: string;
  title: string;
  order: number;
}

interface ArtworkSelectProps {
  value: SelectedArtwork[];
  onChange: (value: SelectedArtwork[]) => void;
  defaultArtworks?: SelectedArtwork[];
  disabled?: boolean;
  error?: string;
  onSearch: (term: string) => void;
  searchResults: Array<{
    id: string;
    title: string;
  }>;
  isLoading?: boolean;
}

export function ArtworkSelect({
  value,
  onChange,
  disabled = false,
  error,
  onSearch,
  searchResults,
  isLoading = false,
}: ArtworkSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [internalArtworks, setInternalArtworks] = useState<SelectedArtwork[]>(
    Array.isArray(value) ? value : [],
  );

  useEffect(() => {
    if (Array.isArray(value)) {
      setInternalArtworks(value);
    }
  }, [value]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      onSearch(term);
    }
  };

  const handleAddArtwork = (artworkId: string, title: string) => {
    if (internalArtworks.some((art) => art.id === artworkId)) {
      return;
    }

    const newArtwork = {
      id: artworkId,
      title,
      order: internalArtworks.length,
    };

    const newArtworks = [...internalArtworks, newArtwork];
    setInternalArtworks(newArtworks);
    onChange(newArtworks);
    setSearchTerm("");
  };

  const handleRemoveArtwork = (artworkId: string) => {
    const filteredArtworks = internalArtworks
      .filter((art) => art.id !== artworkId)
      .map((art, index) => ({ ...art, order: index }));

    setInternalArtworks(filteredArtworks);
    onChange(filteredArtworks);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const items = [...internalArtworks];

    const sourceItem: any = items[result.source.index];
    const itemToMove = { ...sourceItem };

    items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, itemToMove);

    const reorderedArtworks = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setInternalArtworks(reorderedArtworks);
    onChange(reorderedArtworks);
  };

  return (
    <div className="space-y-4">
      {/* 작품 검색 */}
      <div>
        <ComboBox
          items={searchResults.map((item) => ({
            value: item.id,
            label: item.title,
          }))}
          placeholder="작품 검색..."
          inputValue={searchTerm}
          onInputChange={handleSearchChange}
          onSelect={handleAddArtwork}
          isLoading={isLoading}
          disabled={disabled}
        />
      </div>

      {/* 선택된 작품 목록 */}
      {internalArtworks.length > 0 ? (
        <div className="space-y-2">
          <div className="text-sm font-medium">
            선택된 작품 ({internalArtworks.length})
          </div>
          <div className="text-xs text-muted-foreground">
            드래그하여 순서를 변경할 수 있습니다.
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="artwork-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {internalArtworks.map((artwork, index) => (
                    <Draggable
                      key={artwork.id}
                      draggableId={artwork.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center justify-between p-2 border rounded-md ${
                            snapshot.isDragging ? "bg-accent" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {!disabled && (
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>{artwork.title}</div>
                          </div>
                          {!disabled && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveArtwork(artwork.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ) : (
        <div className="py-2 text-center text-sm text-muted-foreground">
          선택된 작품이 없습니다.
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
