import { ProductFormData } from "@/types/product-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetBrandsQuery,
  useGetCategoriesQuery,
  useGetProductQuery,
  useGetProductsQuery,
  useUploadProductImageMutation,
} from "@/state/api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "antd";
import { dummyProduct } from "./dummyProduct";
import { Button } from "@/components/ui/button";

export const ProductFormFields = () => {
  const { control } = useFormContext();
  const { data: categories } = useGetCategoriesQuery();
  const { data: brands } = useGetBrandsQuery();
  const { data: products } = useGetProductsQuery({});

  const [createProduct] = useCreateProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const createDummy = async () => {
    const formattedDummy = dummyProduct.map((item) => {
      return {
        name: item.name,
        description: item.slug,
        price: item.priceVAT,
        categoryId:
          categories?.find(
            (category) => category.name === item.productCategory.categoryName
          )?.id || "uuid-3",
        brandId: "uuid-15",
        stock: item.quantity,
        active: true,
        images: item.imageLanguage.map((img, index) => {
          return {
            url: img.image.secure_url,
            isThumbnail: index === 0,
          };
        }),
      };
    });

    for (let i = 0; i < formattedDummy.length; i++) {
      const { images, ...data } = formattedDummy[i];
      const product = await createProduct(data);
      await uploadProductImage({
        productId: product?.data?.id || "",
        images,
        isUpload: false,
      });
    }
  };

  const deleteDuplicate = () => {
    const duplicateProd = products?.data.filter((product, index) => {
      return products?.data.findIndex((p) => p.name === product.name) !== index;
    });
    duplicateProd?.forEach(async (product) => {
      await deleteProduct(product.id);
    });
  };

  return control ? (
    <div className="space-y-4">
      <div>
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white" id="name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div>
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} className="bg-white" id="description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div>
        <FormField
          control={control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (VND)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="bg-white text-right"
                  id="price"
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex space-x-4">
        <div className="col-span-2">
          <FormField
            control={control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-2">
          <FormField
            control={control}
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {brands?.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-2">
          <FormField
            control={control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-white text-right"
                    id="stock"
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-2">
          <FormField
            control={control}
            name="active"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Active</FormLabel>
                <FormControl>
                  <div>
                    <Switch {...field} className="bg-white" id="active" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      {/* <Button type="button" onClick={createDummy}>
        Create Dummy Product
      </Button>
      <Button type="button" onClick={deleteDuplicate}>
        Delete Duplicate
      </Button> */}
    </div>
  ) : null;
};
