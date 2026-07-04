import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * POST /tags
   * Create a new tag. Requires EDITOR or higher.
   */
  @Post()
  @Roles(Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  /**
   * GET /tags
   * List all tags with post counts.
   */
  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  /**
   * GET /tags/:id
   * Get a single tag by UUID.
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.findOne(id);
  }

  /**
   * GET /tags/slug/:slug
   * Get a single tag by its slug.
   */
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.tagsService.findBySlug(slug);
  }

  /**
   * PUT /tags/:id
   * Update a tag. Requires EDITOR or higher.
   */
  @Put(':id')
  @Roles(Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagsService.update(id, updateTagDto);
  }

  /**
   * DELETE /tags/:id
   * Delete a tag. Requires ADMIN or higher.
   */
  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.remove(id);
  }
}
